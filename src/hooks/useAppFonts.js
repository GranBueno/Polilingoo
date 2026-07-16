import {
    useFonts as useCinzelFonts,
    Cinzel_400Regular,
    Cinzel_700Bold,
    Cinzel_900Black,
} from '@expo-google-fonts/cinzel';

import {
    useFonts as useAlegreyaFonts,
    Alegreya_400Regular,
    Alegreya_500Medium,
    Alegreya_700Bold,
    Alegreya_400Regular_Italic,
} from '@expo-google-fonts/alegreya';

export default function useAppFonts() {
    const [cinzelLoaded, cinzelError] = useCinzelFonts({
        Cinzel_400Regular,
        Cinzel_700Bold,
        Cinzel_900Black,
    });

    const [alegreyaLoaded, alegreyaError] = useAlegreyaFonts({
        Alegreya_400Regular,
        Alegreya_500Medium,
        Alegreya_700Bold,
        Alegreya_400Regular_Italic,
    });

    return {
        fontsLoaded: cinzelLoaded && alegreyaLoaded,
        fontError: cinzelError ?? alegreyaError ?? null,
    };
}
