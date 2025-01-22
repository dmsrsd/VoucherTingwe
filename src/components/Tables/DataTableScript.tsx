import DataTable, { TableColumn } from 'react-data-table-component';
import { memo, useState, useEffect } from 'react';
import "yet-another-react-lightbox/styles.css";
import Spinner from '../../components/Spinner'
import { stagingURL, signOut } from '../../utils';
import {
    Button,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
} from "@material-tailwind/react";
import ModalFormWholesale from '../../components/Forms/ModalFormWholesale';
import { FaTrash, FaPlus, FaEdit } from 'react-icons/fa';
import CustomToast, { showErrorToast, showSuccessToast } from '../../components/Toast/CustomToast';



const CustomLoader = () => (
    <Spinner />
);

interface DataTableProps {
    columns: TableColumn<any>[];
    data: any[];
    selectableRows?: boolean;
    onRowSelected?: (selectedRows: any[]) => void;
    onRefresh: () => void;
}

const DataTableComponent = memo(({ columns, data, selectableRows = true, onRowSelected, onRefresh }: DataTableProps) => {
    const [pending, setPending] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [rowToDelete, setRowToDelete] = useState<any>(null);
    const [open, setOpen] = useState(false);
    const [method, setMethod] = useState('POST');
    const [IdUpdate, setIdUpdate] = useState(null);
    const [openUpdateModal, setOpenUpdateModal] = useState(false);
    const [updateData, setUpdateData] = useState({ id: '', name: '', phone_number: '' });

    useEffect(() => {
        const timeout = setTimeout(() => {
            setPending(false);
        }, 2000);
        return () => clearTimeout(timeout);
    }, []);

    const handleRowSelected = (state: any) => {
        if (onRowSelected) {
            onRowSelected(state.selectedRows);
        }
    };

    const columnsWithActions = [
        ...columns,
        {
            name: 'Action',
            cell: (row: any) => (
                <div className="flex items-center">
                    <button onClick={() => handleSoftDelete(row)} className="bg-red-500 text-white py-2 px-4 rounded flex items-center mr-2">
                        <FaTrash className="mr-2" />
                        Delete
                    </button>
                    <button onClick={() => handleUpdate(row)} className="bg-blue-500 text-white py-2 px-4 rounded flex items-center">
                        <FaEdit className="mr-2" />
                        Update
                    </button>
                </div>
            ),
        },
    ];

    const handleSoftDelete = (row: any) => {
        setRowToDelete(row);
        setOpenDialog(true);
    };

    const confirmSoftDelete = () => {
        if (rowToDelete) {
            console.log('Delete row:', rowToDelete);

            const token = localStorage.getItem('token');
            const myHeaders = new Headers();
            myHeaders.append('Authorization', `Bearer ${token}`);
            myHeaders.append('Content-Type', 'application/json');

            const requestOptions: RequestInit = {
                method: 'PUT',
                headers: myHeaders,
                body: JSON.stringify({
                    name: rowToDelete.name,
                    phone_number: rowToDelete.phone_number,
                    is_active: false
                }),
            };

            fetch(`${stagingURL}/api/wholesales/${rowToDelete.id}/`, requestOptions)
                .then((response) => {
                    if (response.ok) {
                        onRefresh();
                        setTimeout(() => {
                            showSuccessToast('Data berhasil dihapus!');
                        }, 1000);
                    } else {
                        showErrorToast('Error delete data');
                    }
                })
                .catch((error) => {
                    console.error('Error delete data for ID:', rowToDelete.id, error);
                });

            setOpenDialog(false);
        }
    };

    const handleAdd = () => {
        setOpen(true);
        setMethod('POST');
        setIdUpdate(null);
    };

    const postData = (formData: any) => {
        const token = localStorage.getItem('token');
        const myHeaders = new Headers();
        myHeaders.append('Authorization', `Bearer ${token}`);
        myHeaders.append('Content-Type', 'application/json');

        const requestOptions: RequestInit = {
            method: method,
            headers: myHeaders,
            body: JSON.stringify(formData),
        };

        const url = `${stagingURL}/api/wholesales/`;

        fetch(url, requestOptions)
            .then((response) => response.json())
            .then((result) => {
                console.log('res_Post', result);
                setOpen(false);
                onRefresh();
            })
            .catch((error) => {
                console.error('Error posting/updating data:', error);
            });
    };

    const onSubmit = (formData: any, method: string) => {
        if (method == "POST") {
            postData(formData)
        }
    };

    const handleUpdate = (row: any) => {
        setUpdateData({ id: row.id, name: row.name, phone_number: row.phone_number });
        setOpenUpdateModal(true);
    };

    const updateDataHandler = () => {
        const token = localStorage.getItem('token');
        const myHeaders = new Headers();
        myHeaders.append('Authorization', `Bearer ${token}`);
        myHeaders.append('Content-Type', 'application/json');

        const requestOptions: RequestInit = {
            method: 'PUT',
            headers: myHeaders,
            body: JSON.stringify({
                name: updateData.name,
                phone_number: updateData.phone_number,
                is_active: true // Atur sesuai kebutuhan
            }),
        };

        fetch(`${stagingURL}/api/wholesales/${updateData.id}/`, requestOptions)
            .then((response) => {
                if (response.ok) {
                    setOpenUpdateModal(false);
                    onRefresh()
                    setTimeout(() => {
                        showSuccessToast('Data berhasil diupdate!');
                    }, 1000);
                } else {
                    showErrorToast('Error updating data')
                }
            })
            .catch((error) => {
                console.error('Error updating data for ID:', updateData.id, error);
            });
    };

    return (
        <div>
            <CustomToast />

            <button onClick={handleAdd} className="mb-4 bg-green-500 text-white py-2 px-4 rounded flex items-center">
                <FaPlus className="mr-2" />
                Tambah Data
            </button>

            <ModalFormWholesale open={open} handleOpen={() => setOpen(false)} onSubmit={onSubmit} method={method} IdUpdate={IdUpdate} />

            <DataTable
                columns={columnsWithActions}
                data={data}
                selectableRows={selectableRows}
                pagination
                progressPending={pending}
                progressComponent={<CustomLoader />}
                onSelectedRowsChange={handleRowSelected}
            />

            <Dialog open={openDialog} handler={() => setOpenDialog(false)}>
                <DialogHeader>Konfirmasi Hapus</DialogHeader>
                <DialogBody>
                    Apakah Anda yakin ingin menghapus pengguna ini?
                </DialogBody>
                <DialogFooter>
                    <Button variant="text" color="red" onClick={() => setOpenDialog(false)}>
                        Batal
                    </Button>
                    <Button variant="gradient" onClick={confirmSoftDelete}>
                        Ya
                    </Button>
                </DialogFooter>
            </Dialog>

            <Dialog open={openUpdateModal} handler={() => setOpenUpdateModal(false)}>
                <DialogHeader>Update Data</DialogHeader>
                <DialogBody>
                    <div>
                        <label>Nama Agen</label>
                        <input
                            type="text"
                            value={updateData.name}
                            onChange={(e) => setUpdateData({ ...updateData, name: e.target.value })}
                            placeholder="Nama"
                            className="border p-2 w-full"
                        />
                    </div>
                    <div>
                        <label>Nomor Telepon</label>
                        <input
                            value={updateData.phone_number}
                            onChange={(e) => setUpdateData({ ...updateData, phone_number: e.target.value })}
                            placeholder="Nomor Telepon"
                            className="border p-2 w-full mt-2"
                            type="tel"
                            inputMode="numeric"
                        />
                    </div>
                </DialogBody>
                <DialogFooter>
                    <Button variant="text" color="red" onClick={() => setOpenUpdateModal(false)}>
                        Batal
                    </Button>
                    <Button variant="gradient" onClick={updateDataHandler} color="green">
                        Simpan
                    </Button>
                </DialogFooter>
            </Dialog>
        </div>
    );
});

export default DataTableComponent;