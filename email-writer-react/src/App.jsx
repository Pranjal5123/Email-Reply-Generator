import { useState } from "react";
import "./App.css";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Paper,
  AppBar,
  Toolbar,
  createTheme,
  ThemeProvider,
  CssBaseline,
  IconButton,
  InputAdornment,
  Snackbar,
  Alert,
  Tooltip,
  Chip,
} from "@mui/material";
import {
  AutoAwesome,
  ContentCopy,
  Email,
  RestartAlt,
  CheckCircle,
  Error as ErrorIcon,
} from "@mui/icons-material";
import axios from "axios";

// Configure axios
const api = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 seconds timeout
});

const theme = createTheme({
  palette: {
    primary: {
      main: "#3f51b5",
    },
    secondary: {
      main: "#f50057",
    },
    background: {
      default: "#f4f6f8",
    },
  },
  typography: {
    h3: {
      fontWeight: 600,
      color: "#1a237e",
    },
    h6: {
      fontWeight: 500,
    },
    fontFamily: ["Roboto", '"Helvetica Neue"', "Arial", "sans-serif"].join(","),
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
          fontWeight: 600,
          padding: "10px 20px",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 12,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 8,
          },
        },
      },
    },
  },
});

function App() {
  const [emailContent, setEmailContent] = useState("");
  const [tone, setTone] = useState("");
  const [generatedReply, setGeneratedReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [charCount, setCharCount] = useState(0);

  const handleContentChange = (e) => {
    const content = e.target.value;
    setEmailContent(content);
    setCharCount(content.length);
  };

  const handleSubmit = async () => {
    if (!emailContent.trim()) {
      setError("Please enter email content");
      return;
    }

    setLoading(true);
    setError("");
    setGeneratedReply("");

    try {
      const response = await api.post("/email/generate", {
        emailContent: emailContent.trim(),
        tone: tone || undefined,
      });
      console.log(response);

      if (response.data) {
        setGeneratedReply(response.data);
        setSuccessMessage("Email generated successfully!");
      } else {
        setError("No reply generated. Please try again.");
      }
    } catch (error) {
      console.error("API Error:", error);

      if (error.response) {
        // Server responded with error
        const errorData = error.response.data;
        if (errorData.error) {
          setError(
            `Error: ${errorData.error}${
              errorData.details ? ` - ${errorData.details}` : ""
            }`
          );
        } else {
          setError(`Server error: ${error.response.status}`);
        }
      } else if (error.request) {
        // No response received
        setError(
          "No response from server. Please check if the backend is running."
        );
      } else {
        // Request setup error
        setError("Request failed: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard
      .writeText(generatedReply)
      .then(() => {
        setSuccessMessage("Reply copied to clipboard!");
        setOpenSnackbar(true);
      })
      .catch((err) => {
        setError("Failed to copy to clipboard");
      });
  };

  const handleReset = () => {
    setEmailContent("");
    setTone("");
    setGeneratedReply("");
    setError("");
    setCharCount(0);
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") return;
    setOpenSnackbar(false);
  };

  const tones = [
    { value: "", label: "Auto-detect" },
    { value: "professional", label: "Professional" },
    { value: "casual", label: "Casual" },
    { value: "friendly", label: "Friendly" },
    { value: "formal", label: "Formal" },
    { value: "enthusiastic", label: "Enthusiastic" },
  ];

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar
        position="static"
        elevation={0}
        sx={{
          mb: 4,
          background: "linear-gradient(135deg, #c061c9ff 0%, #764ba2 100%)",
        }}
      >
        <Toolbar>
          <Email sx={{ mr: 2, fontSize: 30 }} />
          <Typography
            variant="h5"
            component="div"
            sx={{ flexGrow: 1, fontWeight: "bold" }}
          >
            ReplAI
          </Typography>
          {/* <Chip 
            label="Powered by Gemini AI" 
            color="secondary" 
            size="small"
            sx={{ color: 'white', fontWeight: 'bold' }}
          /> */}
        </Toolbar>
      </AppBar>

      <Container maxWidth="md">
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Generate Perfect Email Replies.
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" paragraph>
            Let AI craft professional responses based on your email content and
            desired tone.
          </Typography>
        </Box>

        <Paper
          elevation={3}
          sx={{
            p: 4,
            mb: 4,
            background: "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Box>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography variant="subtitle2" color="primary">
                  Original Email Content
                </Typography>
                <Typography
                  variant="caption"
                  color={charCount > 10000 ? "error" : "text.secondary"}
                >
                  {charCount}/10000 characters
                </Typography>
              </Box>
              <TextField
                fullWidth
                multiline
                rows={6}
                variant="outlined"
                placeholder="Paste the email you received here..."
                value={emailContent}
                onChange={handleContentChange}
                error={charCount > 10000}
                helperText={charCount > 10000 ? "Content is too long" : ""}
                InputProps={{
                  endAdornment: emailContent && (
                    <InputAdornment
                      position="end"
                      sx={{ alignSelf: "flex-start", mt: 1 }}
                    >
                      <Tooltip title="Clear all">
                        <IconButton
                          onClick={handleReset}
                          edge="end"
                          color="error"
                          size="small"
                        >
                          <RestartAlt />
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <FormControl fullWidth>
              <InputLabel>Select Tone (Optional)</InputLabel>
              <Select
                value={tone}
                label="Select Tone (Optional)"
                onChange={(e) => setTone(e.target.value)}
              >
                {tones.map((toneOption) => (
                  <MenuItem key={toneOption.value} value={toneOption.value}>
                    {toneOption.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="contained"
              size="large"
              onClick={handleSubmit}
              disabled={!emailContent.trim() || loading || charCount > 10000}
              fullWidth
              sx={{
                background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                boxShadow: "0 3px 5px 2px rgba(33, 203, 243, .3)",
                height: "48px",
                fontSize: "16px",
              }}
              startIcon={
                loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  <AutoAwesome />
                )
              }
            >
              {loading ? "Generating Reply..." : "Generate AI Reply"}
            </Button>

            {error && (
              <Alert severity="error" icon={<ErrorIcon />}>
                {error}
              </Alert>
            )}

            {successMessage && !error && (
              <Alert severity="success">{successMessage}</Alert>
            )}
          </Box>
        </Paper>

        {generatedReply && (
          <Paper
            elevation={3}
            sx={{ p: 4, mb: 4, border: "2px solid #e0e0e0" }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Typography
                variant="h5"
                color="primary"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  fontWeight: "bold",
                }}
              >
                <CheckCircle fontSize="medium" /> Generated Email Reply
              </Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  variant="contained"
                  startIcon={<ContentCopy />}
                  onClick={handleCopy}
                  size="medium"
                  color="primary"
                >
                  Copy
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleReset}
                  size="medium"
                  color="secondary"
                >
                  New Email
                </Button>
              </Box>
            </Box>

            <Paper
              variant="outlined"
              sx={{
                p: 3,
                bgcolor: "#fafafa",
                maxHeight: "400px",
                overflow: "auto",
                fontFamily: "monospace",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {generatedReply}
            </Paper>

            <Box
              sx={{
                mt: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Ready to use
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {generatedReply.length} characters
              </Typography>
            </Box>
          </Paper>
        )}

        <Box sx={{ textAlign: "center", mt: 6, mb: 4 }}></Box>
      </Container>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="success"
          sx={{ width: "100%" }}
          elevation={6}
        >
          Reply copied to clipboard!
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}

export default App;
