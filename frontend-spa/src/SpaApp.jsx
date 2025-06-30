// App.jsx

import { useEffect } from "react";
import { AppRoutes } from "./routes/AppRoutes";
import { useAuthStore } from "./hooks";

function App() {

    const { startRenewToken } = useAuthStore();

    useEffect(() => {
        // Verificar token al cargar la aplicación
        startRenewToken();
    }, []);

    return (
        <div className="App">
            <AppRoutes />
        </div>
    );
}

export default App;