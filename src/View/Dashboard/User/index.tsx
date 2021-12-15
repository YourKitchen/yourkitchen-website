import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { userCount, userPagination } from '@yourkitchen/common'
import { User } from '@yourkitchen/models'
import React from 'react'

export const UsersPage: React.FC = () => {
  const [data, setData] = React.useState<User[]>([])
  const [page, setPage] = React.useState(1)
  const [totalUsers, setTotalUsers] = React.useState(0)

  React.useEffect(() => {
    ;(async () => {
      try {
        const [response, count] = await Promise.all([
          userPagination(page),
          userCount(),
        ])
        count && setTotalUsers(count)
        response && setData(response)
      } catch (err) {
        console.error(err)
      }
    })()
  }, [])

  const tableData = React.useMemo(
    () => data.map((val) => ({ ...val, id: val.ID })),
    [data],
  )

  const columns = React.useMemo(() => {
    const cols = [
      { field: 'id', headerName: 'ID', hide: true },
      {
        field: 'name',
        headerName: 'Name',
      },
      {
        field: 'email',
        headerName: 'Email',
        width: 225,
      },
      {
        field: 'role',
        headerName: 'Role',
        width: 75,
      },
      {
        field: 'score',
        headerName: 'Score',
        width: 75,
      },
      {
        field: 'following',
        headerName: 'Following',
        width: 125,
        valueGetter: (params) => params.value.length,
      },
      {
        field: 'followers',
        headerName: 'Followers',
        width: 125,
        valueGetter: (params) => params.value.length,
      },
    ] as GridColDef[]
    return cols.map((col) => ({ ...col, width: col.width ? col.width : 150 }))
  }, [])

  return (
    <div style={{ width: '100%', height: 'calc(100vh - 75px)' }}>
      <DataGrid
        page={page}
        onPageChange={(page) => setPage(page)}
        pageSize={25}
        rowCount={totalUsers}
        columns={columns}
        rows={tableData}
      />
    </div>
  )
}

export default UsersPage
