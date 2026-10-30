import { theme } from "antd";

export function themeConfig(mode: "light" | "dark") {
  return {
    algorithm: mode === "dark" ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: {
      colorPrimary: "#1677ff",
      borderRadius: 6,
      fontSize: 14,
      controlHeight: 32,
      wireframe: false,
    },
    components: {
      Layout: { headerHeight: 56, headerPadding: "0 20px" },
    },
  };
}
