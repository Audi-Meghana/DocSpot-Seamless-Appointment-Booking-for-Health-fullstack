import React, { useEffect, useState } from 'react';
import { Table, Alert, Container, Spinner } from 'react-bootstrap';
import axios from 'axios';

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/admin/getallAppointmentsAdmin', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.success) {
        setAppointments(res.data.data);
      } else {
        setError(res.data.message || 'Failed to fetch appointments.');
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Something went wrong while fetching appointments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  return (
    <div>
      <h2 className="p-3 text-center">All Appointments for Admin Panel</h2>
      <Container>
        {loading ? (
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '150px' }}>
            <Spinner animation="border" variant="primary" />
            <span className="ms-2">Loading appointments...</span>
          </div>
        ) : error ? (
          <Alert variant="danger" className="text-center">{error}</Alert>
        ) : (
          <Table striped bordered hover responsive className="my-3">
            <thead>
              <tr>
                <th>Appointment ID</th>
                <th>User Name</th>
                <th>Doctor Name</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.length > 0 ? (
                appointments.map((appointment) => (
                  <tr key={appointment._id}>
                    <td>{appointment._id}</td>
                    <td>
                      {appointment.userId
                        ? `${appointment.userId.fullName} (${appointment.userId.email})`
                        : 'Unknown User'}
                    </td>
                    <td>
                      {appointment.doctorId
                        ? `${appointment.doctorId.fullName} (${appointment.doctorId.email})`
                        : 'Unknown Doctor'}
                    </td>
                    <td>{appointment.date ? new Date(appointment.date).toLocaleString() : 'N/A'}</td>
                    <td>{appointment.status || 'Pending'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5}>
                    <Alert variant="info" className="text-center mb-0">
                      <Alert.Heading>No Appointments Found</Alert.Heading>
                      <p>There are currently no appointments to display.</p>
                    </Alert>
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        )}
      </Container>
    </div>
  );
};

export default AdminAppointments;
