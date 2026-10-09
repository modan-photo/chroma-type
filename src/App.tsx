import RainbowAsciiMatrix from "./components/RainbowAsciiMatrix";

function App() {
  return (
    <>
      <RainbowAsciiMatrix
        cols={24}
        rows={15}
        gap={4}
        minFontSize={8}
        maxFontSize={36}
      />
    </>
  );
}

export default App;
