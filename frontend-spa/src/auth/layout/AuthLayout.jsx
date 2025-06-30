import { Grid, Typography, Box } from "@mui/material";

export const AuthLayout = ({ children, title = '' }) => {
    return (
        <Box
            sx={{
                minHeight: "100vh",
                background: "linear-gradient(to right, #e0f7fa, #ffffff)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                px: 2,
            }}
        >
            <Box
                sx={{
                    width: { xs: '100%', sm: '80%', md: 420 },
                    bgcolor: "rgba(255, 255, 255, 0.75)",
                    backdropFilter: "blur(12px)",
                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
                    borderRadius: 4,
                    p: { xs: 3, sm: 4 },
                    textAlign: "center",
                }}
                className="animate__animated animate__fadeIn"
            >
                <Typography
                    variant="h4"
                    fontWeight={500}
                    color="#4a6572"
                    mb={3}
                >
                    {title}
                </Typography>

                {children}
            </Box>
        </Box>
    );
};
