"use client"
import { Box, Typography, Paper, Grid, Chip, Divider, Button, Card, CardContent } from "@mui/material"
import {
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Add as AddIcon,
} from "@mui/icons-material"

const SupplierDetails = ({ supplier, onCreateOrder, onEdit, onDelete }) => {
  if (!supplier) {
    return (
      <Typography variant="body1" color="text.secondary">
        No se encontraron datos del proveedor
      </Typography>
    )
  }

  const InfoItem = ({ icon, label, value }) => (
    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
      <Box sx={{ mr: 2, color: "primary.main" }}>{icon}</Box>
      <Box>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="body1">{value || "No especificado"}</Typography>
      </Box>
    </Box>
  )

  return (
    <Box>
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              {supplier.name}
            </Typography>
            <Chip
              label={supplier.status === "active" ? "Activo" : "Inactivo"}
              color={supplier.status === "active" ? "success" : "default"}
              variant="outlined"
            />
          </Box>
          {onCreateOrder && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => onCreateOrder(supplier.id)}
              sx={{ ml: 2 }}
            >
              Nueva Orden
            </Button>
          )}
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  Información de Contacto
                </Typography>

                <InfoItem icon={<PersonIcon />} label="Persona de Contacto" value={supplier.contact_person} />

                <InfoItem icon={<EmailIcon />} label="Email" value={supplier.email} />

                <InfoItem icon={<PhoneIcon />} label="Teléfono" value={supplier.phone} />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  Dirección
                </Typography>

                <InfoItem icon={<LocationIcon />} label="Dirección" value={supplier.address} />

                <InfoItem icon={<BusinessIcon />} label="Ciudad" value={supplier.city} />

                <InfoItem icon={<LocationIcon />} label="País" value={supplier.country} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {supplier.created_at && (
          <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: "divider" }}>
            <Typography variant="body2" color="text.secondary">
              Creado el:{" "}
              {new Date(supplier.created_at).toLocaleDateString("es-ES", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  )
}

export default SupplierDetails
