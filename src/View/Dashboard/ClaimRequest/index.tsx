import LoadingButton from '@mui/lab/LoadingButton'
import { Alert, Snackbar } from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import {
  claimRequestFindMany,
  claimRequestRemoveById,
  recipeUpdateById,
} from '@yourkitchen/common'
import { ClaimRequest } from '@yourkitchen/models'
import React from 'react'

export const ClaimRequestsPage: React.FC = () => {
  // Data
  const [data, setData] = React.useState<ClaimRequest[]>([])

  // Layout
  const [approving, setApproving] = React.useState<string[]>([])
  const [declining, setDeclining] = React.useState<string[]>([])
  const [error, setError] = React.useState<string>()

  /**
   *
   */
  React.useEffect(() => {
    ;(async () => {
      try {
        const response = await claimRequestFindMany()
        response && setData(response)
      } catch (err) {
        console.error(err)
      }
    })()
  }, [])

  /**
   * Add id to data array to ready for table use
   */
  const tableData = React.useMemo(() => {
    return data.map((val) => ({ ...val, id: val._id }))
  }, [data])

  const columns = React.useMemo(
    () =>
      [
        { field: 'id', headerName: 'ID', hide: true },
        {
          field: 'owner.id',
          headerName: 'User ID',
          hide: true,
          valueGetter: (params) => params.row.owner.ID,
        },
        {
          field: 'recipe.id',
          headerName: 'Recipe ID',
          hide: true,
          valueGetter: (params) => params.row.recipe._id,
        },
        {
          field: 'owner.name',
          headerName: 'User Name',
          width: 125,
          valueGetter: (params) => params.row.owner.name,
        },
        {
          field: 'recipe.name',
          headerName: 'Recipe Name',
          width: 125,
          valueGetter: (params) => params.row.recipe.name,
        },

        {
          field: 'message',
          headerName: 'Message',
          minWidth: 300,
        },

        {
          field: 'actions',
          headerName: 'Actions',
          minWidth: 200,
          renderCell: (params) => {
            const id = params.id.toString()
            const disabled = approving.includes(id) || declining.includes(id)
            return (
              <>
                <LoadingButton
                  disabled={disabled}
                  loading={approving.includes(id)}
                  variant="outlined"
                  color="success"
                  onClick={async () => {
                    try {
                      const userId = params.row.owner.ID
                      setApproving((prev) => [...prev, id])
                      await recipeUpdateById(id, { ownerId: userId })
                      await claimRequestRemoveById(id)
                      setData((prev) => prev.filter((val) => val._id !== id))
                    } catch (err) {
                      setError(err.message || err)
                    } finally {
                      setApproving((prev) => prev.filter((val) => val !== id))
                    }
                  }}
                >
                  Approve
                </LoadingButton>
                <LoadingButton
                  style={{ marginLeft: 5 }}
                  disabled={disabled}
                  loading={declining.includes(id)}
                  variant="outlined"
                  color="error"
                  onClick={async () => {
                    try {
                      setDeclining((prev) => [...prev, id])
                      await claimRequestRemoveById(id)
                      setData((prev) => prev.filter((val) => val._id !== id))
                    } catch (err) {
                      setError(err.message || err)
                    } finally {
                      setDeclining((prev) => prev.filter((val) => val !== id))
                    }
                  }}
                >
                  Decline
                </LoadingButton>
              </>
            )
          },
        },
      ] as GridColDef[],
    [approving, declining],
  )

  return (
    <div style={{ width: '100%', height: 400 }}>
      <DataGrid columns={columns} rows={tableData} />

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => {
          setError(undefined)
        }}
      >
        <Alert
          onClose={() => {
            setError(undefined)
          }}
          severity="error"
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>
    </div>
  )
}

export default ClaimRequestsPage
