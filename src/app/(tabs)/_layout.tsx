import { Tabs } from "expo-router";
import { AppHeader } from "../../components/AppHeader";
import { theme } from "../../theme";
import { Ionicons } from "@expo/vector-icons";

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const screens: { name: string; title: string; icon: IconName }[] = [
    { name: 'index', title: 'Home', icon: 'home' },
    { name: 'library', title: 'Library', icon: 'albums' },
    { name: 'server', title: 'Server', icon: 'server' },
    { name: 'player', title: 'Player', icon: 'play-circle' },
    { name: 'settings', title: 'Settings', icon: 'settings' },
];

export default function TabsLayout() {
    return (
        <Tabs screenOptions={{
            tabBarActiveTintColor: theme.colors.primary,
            header: ({ options, route }) => (
                <AppHeader
                    title={options.title ?? route.name}
                    showBack={route.name !== 'index'}   // no back button on Home
                />
            ),
        }}>
            {screens.map((s) => (
                <Tabs.Screen
                    key={s.name}
                    name={s.name}
                    options={{
                        title: s.title,
                        tabBarIcon: ({ color, size }) => <Ionicons name={s.icon} color={color as string} size={size} />,
                    }}
                />
            ))}
        </Tabs>
    );
}