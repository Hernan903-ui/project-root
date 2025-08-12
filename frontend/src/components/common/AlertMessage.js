"use client"

import { useState, useEffect } from "react"
import { Snackbar, Alert, Slide } from "@mui/material"
import PropTypes from "prop-types"

/**
 * Componente para mostrar mensajes de alerta
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.open - Indica si la alerta está abierta
 * @param {string} props.message - Mensaje a mostrar
 * @param {string} props.severity - Severidad de la alerta (success, error, warning, info)
 * @param {number} props.duration - Duración en milisegundos
 * @param {Function} props.onClose - Función a ejecutar al cerrar la alerta
 * @returns {JSX.Element} - Componente AlertMessage
 */
const AlertMessage = ({ open, message, severity = "info", duration = 6000, onClose }) => {
  const [isOpen, setIsOpen] = useState(false)

  // Sincronizar estado interno con props
  useEffect(() => {
    setIsOpen(open)
  }, [open])

  // Manejar cierre de la alerta
  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return
    }

    setIsOpen(false)

    // Ejecutar función onClose después de la animación
    setTimeout(() => {
      if (onClose) {
        onClose()
      }
    }, 300)
  }

  return (
    <Snackbar
      open={isOpen}
      autoHideDuration={duration}
      onClose={handleClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      TransitionComponent={Slide}
    >
      <Alert onClose={handleClose} severity={severity} variant="filled" sx={{ width: "100%" }}>
        {message}
      </Alert>
    </Snackbar>
  )
}

AlertMessage.propTypes = {
  open: PropTypes.bool.isRequired,
  message: PropTypes.string.isRequired,
  severity: PropTypes.oneOf(["success", "error", "warning", "info"]),
  duration: PropTypes.number,
  onClose: PropTypes.func,
}

export default AlertMessage
