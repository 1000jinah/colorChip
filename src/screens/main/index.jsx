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
  Chip
} from "@mui/material";
import { ClearOutlined } from "@mui/icons-material";

const Main = () => {
  const [colorCode, setColorCode] = useState("");
  const [colorCodes, setColorCodes] = useState("");
  const [displayColors, setDisplayColors] = useState([]);
  const [themeMode, setThemeMode] = useState("light");
  const [selectedColorBox, setSelectedColorBox] = useState(null);
  const [showColorValues, setShowColorValues] = useState(true); // State for toggling color values

  const toggleTheme = () => {
    setThemeMode(themeMode === "light" ? "dark" : "light");
  };

  const toggleColorValues = () => {
    setShowColorValues(!showColorValues);
  };

  // Create theme based on themeMode
  const theme = createTheme({
    palette: {
      mode: themeMode
    }
  });

  const applyColor = () => {
    const updatedColorCode = colorCode.replace("#", "");
    applyColors([updatedColorCode]);
    setColorCode("");
  };

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
      return {
        id: index,
        value: `#${formattedHexValue} (${rgb}, ${hsla})`
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
    const updatedDisplayColors = displayColors.filter(
      (color) => color.id !== id
    );
    setDisplayColors(updatedDisplayColors);
    setSelectedColorBox(null); // Clear selected color box
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box>
        <Box>
          <TextField
            label="Enter color code"
            value={colorCode}
            onChange={(e) => setColorCode(e.target.value)}
            variant="outlined"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  {colorCode && (
                    <IconButton
                      onClick={() => setColorCode("")}
                      edge="end"
                      aria-label="Clear Color Code"
                    >
                      <ClearOutlined />
                    </IconButton>
                  )}
                </InputAdornment>
              )
            }}
          />
          <Button variant="contained" onClick={applyColor}>
            Apply Color
          </Button>
          <TextField
            label="Enter color codes (comma separated)"
            value={colorCodes}
            multiline // Allow multiple lines of input
            onChange={(e) => {
              const inputValue = e.target.value
                .replace(/#/g, "") // Remove # symbol
                .replace(/,/g, "") // Remove comma symbol
                .replace(/[^\sA-Fa-f0-9]/g, ""); // Remove any characters other than hex digits
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
              )
            }}
            variant="outlined"
          />

          <Button
            variant="contained"
            onClick={() => {
              const processedCodes = colorCodes
                .replace(/\s+/g, "")
                .split(",")
                .map((code) =>
                  code
                    .replace(/#/g, "")
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
            Apply Colors
          </Button>

          <Button variant="contained" onClick={toggleTheme}>
            Toggle Theme
          </Button>
          <Button variant="contained" onClick={toggleColorValues}>
            Toggle Color Values
          </Button>
          <input
            type="color"
            value={colorCode}
            onChange={(e) => setColorCode(e.target.value)}
          />
        </Box>
        <Box sx={{ mb: 3 }}>
          {displayColors
            .filter((colorObject) => selectedColorBox !== colorObject.id)
            .map((colorObject) => (
              <Chip
                key={`chip_${colorObject.id}`}
                label={colorObject.value}
                onDelete={() => handleChipDelete(colorObject.id)}
                color="default" // Set chip color to default to ensure text color is determined by theme
                style={{
                  backgroundColor: colorObject.value.split(" ")[0],
                  color: getTextColor(colorObject.value) // Set text color based on brightness
                }}
              />
            ))}
        </Box>

        <div>
          {displayColors.map((colorObject, index) => (
            <Box
              key={`${colorObject.id}_${index}`} // Appending index to ensure uniqueness
              width={400}
              height={100}
              bgcolor={colorObject.value.split(" ")[0]} // Display only the HEX color
              color={getTextColor(colorObject.value)}
            >
              {showColorValues &&
                `${colorObject.value}`}
            </Box>
          ))}
        </div>
      </Box>
    </ThemeProvider>
  );
};

export default Main;
