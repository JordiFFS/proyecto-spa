import React from 'react';
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Paper,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Spa,
  WaterDrop,
  Favorite,
  Psychology,
  SelfImprovement,
  LocalFlorist,
  Healing,
  Star,
  Phone,
  Email,
  LocationOn,
  AccessTime,
  ExpandMore,
  Menu,
  Facebook,
  Instagram,
  Twitter
} from '@mui/icons-material';

const SpaInfoView = () => {
  const services = [
    {
      title: "Masajes Terapéuticos",
      description: "Técnicas especializadas para aliviar tensiones musculares y reducir el estrés",
      icon: <Healing sx={{ fontSize: 40 }} />,
      benefits: ["Mejora la circulación", "Reduce dolor muscular", "Alivia el estrés"]
    },
    {
      title: "Tratamientos Faciales",
      description: "Cuidado especializado para rejuvenecer y mantener la salud de tu piel",
      icon: <LocalFlorist sx={{ fontSize: 40 }} />,
      benefits: ["Hidratación profunda", "Anti-envejecimiento", "Limpieza profunda"]
    },
    {
      title: "Hidroterapia",
      description: "Terapias con agua para relajación y recuperación corporal",
      icon: <WaterDrop sx={{ fontSize: 40 }} />,
      benefits: ["Relajación muscular", "Mejora circulación", "Desintoxicación"]
    },
    {
      title: "Aromaterapia",
      description: "Uso de aceites esenciales para bienestar físico y mental",
      icon: <Spa sx={{ fontSize: 40 }} />,
      benefits: ["Reduce ansiedad", "Mejora el sueño", "Equilibrio emocional"]
    }
  ];

  const benefits = [
    {
      title: "Bienestar Físico",
      description: "Mejora la circulación, alivia dolores musculares y fortalece el sistema inmunológico",
      icon: <Favorite color="primary" />
    },
    {
      title: "Salud Mental",
      description: "Reduce el estrés, mejora el estado de ánimo y aumenta la claridad mental",
      icon: <Psychology color="primary" />
    },
    {
      title: "Equilibrio Emocional",
      description: "Proporciona paz interior, reduce la ansiedad y mejora la autoestima",
      icon: <SelfImprovement color="primary" />
    }
  ];

  return (
    <Box sx={{ flexGrow: 1, bgcolor: '#f5f5f5' }}>
      {/* Header */}
      <AppBar position="static" sx={{ bgcolor: '#2e5c3e' }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="menu">
            <Menu />
          </IconButton>
          <Spa sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Sistema de Spa - Wellness Center
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          background: 'linear-gradient(135deg, #2e5c3e 0%, #4a7c5a 100%)',
          color: 'white',
          py: 8,
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
            Descubre el Bienestar Total
          </Typography>
          <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
            Tu refugio de relajación y renovación personal
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Chip label="Relajación" color="secondary" sx={{ bgcolor: 'white', color: '#2e5c3e' }} />
            <Chip label="Bienestar" color="secondary" sx={{ bgcolor: 'white', color: '#2e5c3e' }} />
            <Chip label="Salud" color="secondary" sx={{ bgcolor: 'white', color: '#2e5c3e' }} />
            <Chip label="Equilibrio" color="secondary" sx={{ bgcolor: 'white', color: '#2e5c3e' }} />
          </Box>
        </Container>
      </Box>

      {/* Benefits Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" component="h2" textAlign="center" gutterBottom color="primary">
          ¿Por qué elegir un Spa?
        </Typography>
        <Typography variant="h6" textAlign="center" color="text.secondary" sx={{ mb: 6 }}>
          Los spas ofrecen múltiples beneficios para tu salud física, mental y emocional
        </Typography>

        <Grid container spacing={4}>
          {benefits.map((benefit, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card sx={{ height: '100%', textAlign: 'center', p: 3 }}>
                <CardContent>
                  <Box sx={{ mb: 2 }}>
                    {benefit.icon}
                  </Box>
                  <Typography variant="h5" component="h3" gutterBottom color="primary">
                    {benefit.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {benefit.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Services Section */}
      <Box sx={{ bgcolor: 'white', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" textAlign="center" gutterBottom color="primary">
            Nuestros Servicios
          </Typography>
          <Typography variant="h6" textAlign="center" color="text.secondary" sx={{ mb: 6 }}>
            Descubre nuestra amplia gama de tratamientos especializados
          </Typography>

          <Grid container spacing={4}>
            {services.map((service, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ mr: 2, color: 'primary.main' }}>
                        {service.icon}
                      </Box>
                      <Typography variant="h5" component="h3" color="primary">
                        {service.title}
                      </Typography>
                    </Box>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                      {service.description}
                    </Typography>
                    <Typography variant="h6" color="primary" gutterBottom>
                      Beneficios:
                    </Typography>
                    <List dense>
                      {service.benefits.map((benefit, idx) => (
                        <ListItem key={idx} sx={{ pl: 0 }}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <Star color="secondary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary={benefit} />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* FAQ Section */}
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Typography variant="h3" component="h2" textAlign="center" gutterBottom color="primary">
          Preguntas Frecuentes
        </Typography>
        <Typography variant="h6" textAlign="center" color="text.secondary" sx={{ mb: 4 }}>
          Resolvemos tus dudas sobre nuestros servicios
        </Typography>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h6">¿Cuáles son los beneficios de los masajes regulares?</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              Los masajes regulares ayudan a reducir el estrés, mejorar la circulación sanguínea, 
              aliviar dolores musculares, aumentar la flexibilidad y promover un sueño reparador. 
              También fortalecen el sistema inmunológico y mejoran el bienestar general.
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h6">¿Con qué frecuencia debo visitar el spa?</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              La frecuencia ideal varía según tus necesidades. Para mantenimiento general, 
              se recomienda una visita mensual. Para tratamientos específicos o mayor relajación, 
              cada 2-3 semanas es óptimo. Tu terapeuta puede personalizar un plan según tus objetivos.
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h6">¿Qué debo esperar en mi primera visita?</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              En tu primera visita, completarás un formulario de salud, tendrás una consulta 
              con tu terapeuta para discutir tus necesidades y objetivos, y recibirás 
              recomendaciones personalizadas. Te explicaremos todos los procedimientos 
              para que te sientas cómodo y relajado.
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h6">¿Los tratamientos de spa son seguros?</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              Sí, todos nuestros tratamientos son realizados por profesionales certificados 
              usando técnicas seguras y productos de alta calidad. Siempre evaluamos tu 
              historial médico y alergias antes de cualquier tratamiento para garantizar 
              tu seguridad y bienestar.
            </Typography>
          </AccordionDetails>
        </Accordion>
      </Container>

      {/* Information Cards */}
      <Box sx={{ bgcolor: '#f8f9fa', py: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                <AccessTime sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom color="primary">
                  Horarios Flexibles
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Abierto 7 días a la semana con horarios extendidos para adaptarnos a tu agenda
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                <Healing sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom color="primary">
                  Profesionales Certificados
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Nuestro equipo está formado por terapeutas certificados con años de experiencia
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                <LocalFlorist sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom color="primary">
                  Productos Naturales
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Utilizamos únicamente productos orgánicos y naturales de la más alta calidad
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Contact Section */}
      <Box sx={{ bgcolor: '#2e5c3e', color: 'white', py: 6 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography variant="h4" gutterBottom>
                Contacta con Nosotros
              </Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                ¿Listo para comenzar tu journey de bienestar? Contáctanos para más información 
                o para programar tu primera sesión.
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Phone sx={{ mr: 2 }} />
                <Typography variant="body1">+593 2 123-4567</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Email sx={{ mr: 2 }} />
                <Typography variant="body1">info@wellness-spa.com</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <LocationOn sx={{ mr: 2 }} />
                <Typography variant="body1">Quito, Ecuador</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h5" gutterBottom>
                Síguenos en Redes Sociales
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <IconButton color="inherit" size="large">
                  <Facebook />
                </IconButton>
                <IconButton color="inherit" size="large">
                  <Instagram />
                </IconButton>
                <IconButton color="inherit" size="large">
                  <Twitter />
                </IconButton>
              </Box>
              <Button 
                variant="contained" 
                size="large" 
                sx={{ 
                  bgcolor: 'white', 
                  color: '#2e5c3e',
                  '&:hover': { bgcolor: '#f0f0f0' }
                }}
              >
                Reservar Cita
              </Button>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: '#1a1a1a', color: 'white', py: 3, textAlign: 'center' }}>
        <Container maxWidth="lg">
          <Typography variant="body2">
            © 2024 Sistema de Spa - Wellness Center. Todos los derechos reservados.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default SpaInfoView;