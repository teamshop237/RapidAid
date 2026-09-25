jest.mock("expo-font", () => ({
  isLoaded: jest.fn(() => true),
  loadAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock("react-native-safe-area-context", () => ({
  initialWindowMetrics: {
    frame: { height: 800, width: 400, x: 0, y: 0 },
    insets: { bottom: 0, left: 0, right: 0, top: 0 },
  },
  SafeAreaProvider: ({ children }: React.PropsWithChildren) => children,
  SafeAreaView: ({ children }: React.PropsWithChildren) => children,
  useSafeAreaInsets: () => ({ bottom: 0, left: 0, right: 0, top: 0 }),
}));
