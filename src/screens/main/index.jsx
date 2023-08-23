import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  ThemeProvider,
  createTheme,
  CssBaseline,
  InputAdornment,
  IconButton,
  Chip,
  Typography,
  Alert,
} from "@mui/material";
import {
  ClearOutlined,
  DarkModeOutlined,
  LightModeOutlined,
} from "@mui/icons-material";

const Main = () => {
  const [colorCodes, setColorCodes] = useState("");
  const [pickedColor, setPickedColor] = useState("");
  const [displayColors, setDisplayColors] = useState([]);
  const [themeMode, setThemeMode] = useState("light");
  const [selectedColorBox, setSelectedColorBox] = useState(null);
  const [showColorValues, setShowColorValues] = useState(true);
  const [editingColorBox, setEditingColorBox] = useState(null);
  const [showChips, setShowChips] = useState(false);
  const [showCopySuccess, setShowCopySuccess] = useState(false);

  const copyColorValue = (e, value) => {
    e.stopPropagation(); // Prevent colorBox onClick event from being triggered

    const formattedValue = value
      .replace(/[\s()]/g, ",")
      .replace(/,,+/g, ",") // Replace consecutive commas with a single comma
      .replace(/,(\s*rgb),/g, ",$1(") // Change ", rgb" to " rgb("
      .replace(/,(\s*hsl),/g, "),$1(") // Change ", hsl" to ") hsl("
      .replace(/%,\s*/, "test") // Change "%," to "%"
      .replace(/%,/, "%)") // Change "%," to "%)"
      .replace(/test\s*/, "%,") // Change "%," to "%"
      .replace(/,/g, ", "); // Add space after commas

    const textarea = document.createElement("textarea");
    textarea.value = formattedValue;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);

    setShowCopySuccess(true); // Show the success message
    setTimeout(() => {
      setShowCopySuccess(false); // Hide the success message after 3 seconds
    }, 60000);
  };

  const handleColorBoxClick = (colorObject) => {
    setEditingColorBox(colorObject.id);
  };

  const handleColorBoxBlur = () => {
    setEditingColorBox(null);
  };
  const toggleTheme = () => {
    setThemeMode(themeMode === "light" ? "dark" : "light");
  };
  //1)
  // const toggleColorValues = () => {
  //   setShowColorValues(!showColorValues);
  // };

  // Create theme based on themeMode
  const theme = createTheme({
    palette: {
      mode: themeMode,
    },
  });

  const applyColors = (codes) => {
    const validColorCodes = codes
      .map((code) => code.trim())
      .filter((code) => {
        // Check if the code contains at least 3 hexadecimal digits
        return code.match(/[0-9A-Fa-f]{3}/) !== null;
      });

    const updatedDisplayColors = validColorCodes.map((code, index) => {
      // Process the code to handle "#" and ","

      let hexValue = code.includes("#") ? code.replace("#", "") : code;

      // Add a comma at appropriate position if needed

      const formattedHexValue =
        hexValue.length === 3 ? hexValue.repeat(2) : hexValue.slice(0, 6);

      const r = parseInt(formattedHexValue.slice(0, 2), 16);
      const g = parseInt(formattedHexValue.slice(2, 4), 16);
      const b = parseInt(formattedHexValue.slice(4, 6), 16);
      const hsl = rgbToHsl(r, g, b);
      const rgb = `rgb(${r}, ${g}, ${b})`;
      const hsla = `hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)`;

      const uniqueId = new Date().getTime() + index;

      return {
        id: uniqueId, // Use the unique ID
        value: `#${formattedHexValue} ${rgb} ${hsla}`,
      };
    });

    setDisplayColors([...displayColors, ...updatedDisplayColors]);
  };

  const rgbToHsl = (r, g, b) => {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h,
      s,
      l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
        default:
          break;
      }

      h /= 6;
    }

    h = Math.round(h * 360);
    s = Math.round(s * 100);
    l = Math.round(l * 100);

    return [h, s, l];
  };

  const getTextColor = (backgroundColor) => {
    const hexColor = backgroundColor.split(" ")[0];
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);

    // Calculate perceived brightness using formula
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    // Determine text color based on brightness
    return brightness < 128 ? "#e9e9e9" : "#333";
  };

  const handleChipDelete = (id) => {
    const colorToDelete = displayColors.find((color) => color.id === id);
    const updatedDisplayColors = displayColors.filter(
      (color) => color.id !== id
    );
    setDisplayColors(updatedDisplayColors);

    if (selectedColorBox === colorToDelete.id) {
      setSelectedColorBox(null); // Clear selected color box if it matches the deleted chip's color
    }
  };

  const handleReset = () => {
    setDisplayColors([]);
    setSelectedColorBox(null);
  };
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          p: 5,
          height: "100vh",
          textAlign: "center",
          position: "relative",
        }}
      >
        <Typography variant="h2">Color Chip</Typography>
        <IconButton
          sx={{ position: "absolute", top: 20, right: 20 }}
          onClick={toggleTheme}
        >
          {themeMode === "light" ? (
            <LightModeOutlined
              sx={{
                fontSize: 30,
                color: "#333",
              }}
            />
          ) : (
            <DarkModeOutlined
              sx={{
                fontSize: 30,
                color: "#e9e9e9",
              }}
            />
          )}
        </IconButton>
        <Box sx={{ py: 3 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <input
              style={{ width: "100px", height: "100px" }}
              type="color"
              value={pickedColor}
              onChange={(e) => {
                const colorValue = e.target.value;
                setPickedColor(colorValue);
              }}
              onBlur={(e) => {
                const hexColor = e.target.value.slice(1); // Remove the "#" symbol
                const hexCode = hexColor.slice(0, 6);

                // Update the color codes TextField when the color picker dialog is closed
                setColorCodes((prevCodes) =>
                  prevCodes ? prevCodes + `,#${hexCode}` : `#${hexCode}`
                );

                // Add the selected color to displayColors
                const r = parseInt(hexCode.slice(0, 2), 16);
                const g = parseInt(hexCode.slice(2, 4), 16);
                const b = parseInt(hexCode.slice(4, 6), 16);
                const hsl = rgbToHsl(r, g, b);
                const rgb = `rgb(${r}, ${g}, ${b})`;
                const hsla = `hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)`;
                const newColor = {
                  id: displayColors.length,
                  value: `#${hexCode}  ${rgb}  ${hsla}`,
                };
                setDisplayColors((prevColors) => [...prevColors, newColor]);
              }}
            />

            <TextField
              label="색상코드를 기입해주세요"
              sx={{
                maxWidth: 550,
                width: "100%",
                mb: 3,
                height: "70px",
                overflowY: "auto",
                overflowX: "clip",
              }}
              value={colorCodes}
              multiline // Allow multiple lines of input
              onChange={(e) => {
                const inputValue = e.target.value
                  .replace(/,/g, "") // Remove comma symbol
                  .replace(/[^\sA-Fa-f0-9#]/g, ""); // Remove any characters other than hex digits and #
                const formattedValue = inputValue
                  .replace(/([A-Fa-f0-9]{6})/g, "$1,") // Add comma after every 6 characters
                  .replace(/,$/, ""); // Remove trailing comma if present
                setColorCodes(formattedValue);
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {colorCodes && (
                      <IconButton
                        onClick={() => setColorCodes("")}
                        edge="end"
                        aria-label="Clear Color Code"
                      >
                        <ClearOutlined />
                      </IconButton>
                    )}
                  </InputAdornment>
                ),
              }}
              variant="standard"
            />

            <Box
              sx={{
                maxWidth: 550,
                width: "100%",
                mb: 3,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Button
                  sx={{ mr: 1 }}
                  variant="contained"
                  onClick={() => {
                    const processedCodes = colorCodes
                      .replace(/\s+/g, "")
                      .split(",")
                      .map((code) =>
                        code
                          .replace(/#/g, "") // Remove # symbol
                          .replace(/(.{6})/g, '"$1",')
                          .slice(0, -2)
                      )
                      .map((code) => code.replace(/""/g, '"'))
                      .map((code) => code.replace(/^"|"$/g, "")); // Remove quotes from the beginning and end

                    applyColors(processedCodes);

                    // Display the processed codes in the console
                    console.log("Processed Color Codes:", processedCodes);
                  }}
                >
                  색상 추가
                </Button>
                <Button
                  sx={{ mr: 1 }}
                  variant="contained"
                  onClick={() => setShowChips(!showChips)}
                >
                  {showChips ? "색상 칩 제거" : "색상 칩 보기"}
                </Button>
                {/* 1) */}
                {/* <Button variant="contained" onClick={toggleColorValues}>
                  색상 속성 코드 생략
                </Button> */}
              </Box>
              <Box>
                <Button variant="contained" color="error" onClick={handleReset}>
                  리셋
                </Button>
              </Box>
            </Box>
          </Box>
          <Box
            sx={{
              mb: 3,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: "1rem",
            }}
          >
            {showChips &&
              displayColors
                .filter((colorObject) => selectedColorBox !== colorObject.id)
                .map((colorObject) => (
                  <Chip
                    key={`chip_${colorObject.id}`}
                    label={colorObject.value}
                    onDelete={() => handleChipDelete(colorObject.id)}
                    onClick={(e) => copyColorValue(e, colorObject.value)}
                    color="default"
                    style={{
                      backgroundColor: colorObject.value.split(" ")[0],
                      color: getTextColor(colorObject.value),
                    }}
                    sx={{
                      ".MuiChip-deleteIcon": {
                        backgroundColor: colorObject.value.split(" ")[0],
                        color: getTextColor(colorObject.value),
                        ":hover": {
                          backgroundColor: colorObject.value.split(" ")[0],
                          color: getTextColor(colorObject.value),
                        },
                      },
                    }}
                  />
                ))}
          </Box>

          <div style={{ display: "flex", flexWrap: "wrap" }}>
            {displayColors.map((colorObject, index) => (
              <Box
                key={`colorBox_${colorObject.id}`}
                width={100}
                height={100}
                bgcolor={colorObject.value.split(" ")[0]}
                color={getTextColor(colorObject.value)}
                onClick={() => handleColorBoxClick(colorObject)}
                onBlur={handleColorBoxBlur}
                sx={{
                  position: "relative",
                  cursor: "pointer",
                  border:
                    editingColorBox === colorObject.id
                      ? "2px dotted gold"
                      : "none", // Add this line
                }}
              >
                {editingColorBox === colorObject.id ? (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",

                      justifyContent: "space-around",
                      height: "100%",
                    }}
                  >
                    <Button
                      sx={{ p: 0.5, fontSize: 12 }}
                      variant="contained"
                      onClick={(e) => copyColorValue(e, colorObject.value)}
                    >
                      코드복사
                    </Button>
                    <input
                      type="color"
                      value={colorCodes}
                      onChange={(e) => {
                        const colorValue = e.target.value;
                        setPickedColor(colorValue);

                        const hexColor = colorValue.slice(1); // Remove the "#" symbol
                        const hexCode = hexColor.slice(0, 6);

                        setColorCodes(`#${hexCode}`);

                        const r = parseInt(hexCode.slice(0, 2), 16);
                        const g = parseInt(hexCode.slice(2, 4), 16);
                        const b = parseInt(hexCode.slice(4, 6), 16);
                        const hsl = rgbToHsl(r, g, b);
                        const rgb = `rgb(${r}, ${g}, ${b})`;
                        const hsla = `hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)`;
                        const updatedColorObject = {
                          ...colorObject,
                          value: `#${hexCode} ${rgb} ${hsla}`,
                        };

                        const updatedDisplayColors = displayColors.map(
                          (color) =>
                            color.id === colorObject.id
                              ? updatedColorObject
                              : color
                        );
                        setDisplayColors(updatedDisplayColors);
                      }}
                      onBlur={handleColorBoxBlur}
                    />
                  </Box>
                ) : (
                  showColorValues && (
                    <React.Fragment>
                      <Box
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          fontSize: "0.78rem",
                          alignItems: "center",
                          justifyContent: "center",
                          height: "100%",
                        }}
                      >
                        {/* {colorObject.value} */}
                      </Box>
                    </React.Fragment>
                  )
                )}
              </Box>
            ))}
          </div>
        </Box>
        {showCopySuccess && (
          <Alert
            severity="success"
            color="info"
            sx={{
              position: "absolute",
              color: "#29b6f6",
              backgroundColor: "#e5f6fd",
              bottom: 20,
              right: 20,
              zIndex: 1,
              display: showCopySuccess ? "flex" : "none", // Apply fadeout animation if showCopySuccess is true
            }}
          >
            색상 코드 복사가 완료되었습니다!
          </Alert>
        )}
      </Box>
    </ThemeProvider>
  );
};

export default Main;
