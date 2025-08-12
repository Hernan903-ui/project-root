"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  IconButton,
  Tooltip,
  Typography,
  Box,
  Chip,
  Divider,
  Menu,
  MenuItem,
  Alert,
} from "@mui/material"
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  MoreVert as MoreVertIcon,
  LocalShipping as ShippingIcon,
  Print as PrintIcon,
  Send as SendIcon,
  Add as AddIcon,
} from "@mui/icons-material"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import PurchaseOrderFilters from "./PurchaseOrderFilters"

// Función para formato seguro de fechas
const formatDate = (dateString) => {
  if (!dateString) return "N/A"
  try {
    return format(new Date(dateString), "dd/MM/yyyy", { locale: es })
  } catch (error) {
    console.error("Error formatting date:", dateString, error)
    return "Fecha inválida"
  }
}

const getStatusChip = (status) => {
  switch (status) {
    case "draft":
      return <Chip label="Borrador" color="default" size="small" />
    case "pending":
      return <Chip label="Pendiente" color="warning" size="small" />
    case "confirmed":
      return <Chip label="Confirmada" color="info" size="small" />
    case "received":
      return <Chip label="Recibida" color="success" size="small" />
    case "cancelled":
      return <Chip label="Cancelada" color="error" size="small" />
    default:
      return <Chip label="Desconocido" size="small" />
  }
}

const PurchaseOrderList = ({
  purchaseOrders = [],
  totalItems = 0,
  loading = false,
  onDelete = () => {},
  onFilter = () => {},
  page = 0,
  setPage = () => {},
  rowsPerPage = 10,
  setRowsPerPage = () => {},
  isOfflineData = false,
}) => {
  const navigate = useNavigate()
  const [showFilters, setShowFilters] = useState(false)
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null)
  const [selectedOrderId, setSelectedOrderId] = useState(null)
  const [error, setError] = useState(null)

  // Verificar que purchaseOrders sea un array
  const safeOrders = Array.isArray(purchaseOrders) ? purchaseOrders : []

  const handleChangePage = (event, newPage) => {
    try {
      setPage(newPage)
    } catch (error) {
      console.error("Error cambiando página:", error)
      setError("Error al cambiar de página")
    }
  }

  const handleChangeRowsPerPage = (event) => {
    try {
      setRowsPerPage(Number.parseInt(event.target.value, 10))
      setPage(0)
    } catch (error) {
      console.error("Error cambiando filas por página:", error)
      setError("Error al cambiar filas por página")
    }
  }

  const handleOpenMenu = (event, orderId) => {
    try {
      setActionMenuAnchor(event.currentTarget)
      setSelectedOrderId(orderId)
    } catch (error) {
      console.error("Error abriendo menú:", error)
    }
  }

  const handleCloseMenu = () => {
    setActionMenuAnchor(null)
    setSelectedOrderId(null)
  }

  const goToOrderDetails = (id) => {
    try {
      navigate(`/purchase-orders/${id}`)
    } catch (error) {
      console.error("Error navegando a detalles:", error)
    }
  }

  const goToReceiveOrder = (id) => {
    try {
      navigate(`/purchase-orders/${id}/receive`)
      handleCloseMenu()
    } catch (error) {
      console.error("Error navegando a recibir orden:", error)
    }
  }

  const goToEditOrder = (id) => {
    try {
      navigate(`/purchase-orders/edit/${id}`)
      handleCloseMenu()
    } catch (error) {
      console.error("Error navegando a editar orden:", error)
    }
  }

  const handleDeleteOrder = (id) => {
    try {
      onDelete(id)
      handleCloseMenu()
    } catch (error) {
      console.error("Error eliminando orden:", error)
      setError("Error al intentar eliminar la orden")
    }
  }

  const handlePrintOrder = (id) => {
    try {
      console.log("Printing order:", id)
      handleCloseMenu()
    } catch (error) {
      console.error("Error imprimiendo orden:", error)
    }
  }

  const handleSendOrder = (id) => {
    try {
      console.log("Sending order:", id)
      handleCloseMenu()
    } catch (error) {
      console.error("Error enviando orden:", error)
    }
  }

  const findOrderById = (id) => {
    if (!id) return null
    return safeOrders.find((o) => o && o.id === id) || null
  }

  const selectedOrder = findOrderById(selectedOrderId)

  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
      {error && (
        <Alert severity="error" sx={{ m: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h6">Órdenes de Compra</Typography>
        <Box>
          <Button variant="outlined" onClick={() => setShowFilters(!showFilters)} sx={{ mr: 1 }}>
            {showFilters ? "Ocultar filtros" : "Mostrar filtros"}
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate("/purchase-orders/create")}
          >
            Nueva Orden
          </Button>
        </Box>
      </Box>

      {showFilters && (
        <>
          <Divider />
          <PurchaseOrderFilters onFilter={onFilter} />
        </>
      )}

      <TableContainer sx={{ maxHeight: "calc(100vh - 240px)" }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              <TableCell>Orden #</TableCell>
              <TableCell>Proveedor</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Entrega Estimada</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell align="center">Estado</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Cargando órdenes de compra...
                </TableCell>
              </TableRow>
            ) : safeOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Box sx={{ py: 4 }}>
                    <Typography variant="h6" color="textSecondary" gutterBottom>
                      No se encontraron órdenes de compra
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                      Comience creando su primera orden de compra
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<AddIcon />}
                      onClick={() => navigate("/purchase-orders/create")}
                    >
                      Crear Primera Orden
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              safeOrders
                .map((order) => {
                  if (!order || typeof order !== "object") {
                    console.error("Orden inválida en purchaseOrders:", order)
                    return null
                  }

                  const {
                    id = "N/A",
                    order_number = id,
                    supplier_name = "Proveedor no disponible",
                    order_date = null,
                    expected_delivery_date = null,
                    total_amount = 0,
                    status = "unknown",
                  } = order

                  return (
                    <TableRow hover key={id}>
                      <TableCell>
                        <Box sx={{ fontWeight: "medium" }}>#{order_number}</Box>
                      </TableCell>
                      <TableCell>{supplier_name}</TableCell>
                      <TableCell>{formatDate(order_date)}</TableCell>
                      <TableCell>{formatDate(expected_delivery_date) || "No especificada"}</TableCell>
                      <TableCell align="right">
                        ${typeof total_amount === "number" ? total_amount.toFixed(2) : "0.00"}
                      </TableCell>
                      <TableCell align="center">{getStatusChip(status)}</TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                          <Tooltip title="Ver detalles">
                            <IconButton size="small" onClick={() => goToOrderDetails(id)}>
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>

                          {status !== "cancelled" && status !== "received" && (
                            <Tooltip title="Recibir mercancía">
                              <IconButton size="small" color="success" onClick={() => goToReceiveOrder(id)}>
                                <ShippingIcon />
                              </IconButton>
                            </Tooltip>
                          )}

                          <IconButton size="small" onClick={(e) => handleOpenMenu(e, id)} aria-label="más opciones">
                            <MoreVertIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )
                })
                .filter(Boolean)
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={totalItems}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Filas por página"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
      />

      {/* Menú de acciones */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={handleCloseMenu}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <MenuItem onClick={() => goToOrderDetails(selectedOrderId)}>
          <ViewIcon fontSize="small" sx={{ mr: 1 }} />
          Ver detalles
        </MenuItem>

        {selectedOrder && selectedOrder.status !== "cancelled" && selectedOrder.status !== "received" && (
          <>
            <MenuItem onClick={() => goToEditOrder(selectedOrderId)}>
              <EditIcon fontSize="small" sx={{ mr: 1 }} />
              Editar
            </MenuItem>

            <MenuItem onClick={() => goToReceiveOrder(selectedOrderId)}>
              <ShippingIcon fontSize="small" sx={{ mr: 1 }} />
              Recibir mercancía
            </MenuItem>
          </>
        )}

        <MenuItem onClick={() => handlePrintOrder(selectedOrderId)}>
          <PrintIcon fontSize="small" sx={{ mr: 1 }} />
          Imprimir
        </MenuItem>

        <MenuItem onClick={() => handleSendOrder(selectedOrderId)}>
          <SendIcon fontSize="small" sx={{ mr: 1 }} />
          Enviar al proveedor
        </MenuItem>

        <Divider />

        {selectedOrder && selectedOrder.status === "draft" && (
          <MenuItem onClick={() => handleDeleteOrder(selectedOrderId)} sx={{ color: "error.main" }}>
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
            Eliminar
          </MenuItem>
        )}
      </Menu>
    </Paper>
  )
}

export default PurchaseOrderList
