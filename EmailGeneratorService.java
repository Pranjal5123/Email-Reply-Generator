package email_writer.demo.app;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class EmailGeneratorService {

    private final WebClient webClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    public EmailGeneratorService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder
                .baseUrl("https://generativelanguage.googleapis.com")
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    public String generateEmailReply(EmailRequest emailRequest) {
        log.info("Generating email reply with tone: {}", emailRequest.getTone());
        
        // Build the prompt
        String prompt = buildPrompt(emailRequest);
        log.debug("Generated prompt: {}", prompt);

        // Build request parts
        Map<String, Object> textPart = new HashMap<>();
        textPart.put("text", prompt);
        
        List<Map<String, Object>> partsList = new ArrayList<>();
        partsList.add(textPart);
        
        Map<String, Object> content = new HashMap<>();
        content.put("parts", partsList);
        
        List<Map<String, Object>> contentsList = new ArrayList<>();
        contentsList.add(content);
        
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("contents", contentsList);
        
        // Add generation config for better results
        Map<String, Object> generationConfig = new HashMap<>();
        generationConfig.put("temperature", 0.7);
        generationConfig.put("topK", 40);
        generationConfig.put("topP", 0.95);
        generationConfig.put("maxOutputTokens", 1024);
        requestBody.put("generationConfig", generationConfig);

        try {
            log.info("Calling Gemini API...");
            
            // Make API call using the latest model
            String response = webClient.post()
                    .uri("/v1beta/models/gemini-2.5-flash:generateContent?key=" + geminiApiKey)
                    .bodyValue(requestBody)
                    .retrieve()
                    .onStatus(status -> status.is4xxClientError() || status.is5xxServerError(),
                            clientResponse -> clientResponse.bodyToMono(String.class)
                                    .flatMap(errorBody -> {
                                        log.error("Gemini API error: {}", errorBody);
                                        return Mono.error(new RuntimeException("Gemini API error: " + errorBody));
                                    }))
                    .bodyToMono(String.class)
                    .block();

            log.debug("Received response from Gemini API");
            
            // Extract and return the response content
            return extractResponseContent(response);
        } catch (Exception e) {
            log.error("Failed to generate email: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to generate email: " + e.getMessage(), e);
        }
    }

    private String extractResponseContent(String response) {
        try {
            JsonNode rootNode = objectMapper.readTree(response);
            
            // Check if response has candidates
            if (!rootNode.has("candidates") || rootNode.get("candidates").isEmpty()) {
                JsonNode errorNode = rootNode.path("error");
                if (errorNode != null && !errorNode.isMissingNode()) {
                    throw new RuntimeException("Gemini API Error: " + errorNode.path("message").asText());
                }
                throw new RuntimeException("No candidates in Gemini API response");
            }
            
            JsonNode firstCandidate = rootNode.get("candidates").get(0);
            
            // Check for safety ratings
            if (firstCandidate.has("finishReason") && 
                "SAFETY".equals(firstCandidate.get("finishReason").asText())) {
                return "The email content was blocked by safety filters. Please try different content.";
            }
            
            // Extract text content
            String text = firstCandidate.path("content")
                    .path("parts")
                    .get(0)
                    .path("text")
                    .asText()
                    .trim();
            
            if (text.isEmpty()) {
                return "Generated email is empty. Please try again.";
            }
            
            return text;
        } catch (Exception e) {
            log.error("Error processing Gemini API response: {}", e.getMessage(), e);
            return "Error processing AI response: " + e.getMessage();
        }
    }

    private String buildPrompt(EmailRequest emailRequest) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("You are a professional email assistant. Generate a well-structured email reply based on the following email.\n\n");
        prompt.append("INSTRUCTIONS:\n");
        prompt.append("1. Write a complete email reply (including salutation and closing)\n");
        prompt.append("2. DO NOT include a subject line\n");
        prompt.append("3. Keep the reply concise but comprehensive (150-250 words)\n");
        prompt.append("4. Maintain professional formatting\n");
        
        if (emailRequest.getTone() != null && !emailRequest.getTone().isEmpty()) {
            prompt.append("5. Use a ").append(emailRequest.getTone()).append(" tone\n");
        }
        
        prompt.append("\nORIGINAL EMAIL:\n");
        prompt.append("```\n");
        prompt.append(emailRequest.getEmailContent());
        prompt.append("\n```\n\n");
        prompt.append("GENERATED REPLY:");
        
        return prompt.toString();
    }
}