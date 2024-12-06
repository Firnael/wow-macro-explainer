import { Box, Grid } from '@chakra-ui/react';
import { ColorModeSwitcher } from './Components/ColorModeSwitcher/ColorModeSwitcher';
import { MacroCode } from './Components/MacroCode/MacroCode';
import './App.css';

function App() {
    return (
        <div className="App">
            <ColorModeSwitcher justifySelf="flex-end" />
            <Box>
                <Grid minH="100vh" p={3}>
                    <MacroCode />
                </Grid>
            </Box>
        </div>
    );
}

export default App;
