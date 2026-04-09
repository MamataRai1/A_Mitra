import React, { useEffect, useState } from "react";
import API from "../../api";
import { useNavigate } from "react-router-dom";

const PaymentSuccess = () => {
    const [status, setStatus] = useState("Verifying payment...");
    const navigate = useNavigate();

    useEffect(() => {
        const verifyPayment = async () => {
            const params = new URLSearchParams(window.location.search);
            const pidx = params.get("pidx");
            const token = localStorage.getItem('access_token');

            if (pidx) {
                try {
                    const res = await API.post("/payment/verify/", { pidx });
                    
                    if (res.data.message === "Payment successful") {
                        setStatus("Payment successful! Redirecting...");
                        setTimeout(() => navigate('/bookings'), 3000);
                    } else {
                        setStatus("Payment verified or failed: " + res.data.message);
                    }
                } catch (error) {
                    console.error("Verification error:", error);
                    setStatus("Failed to verify payment. Please contact support.");
                }
            } else {
                setStatus("No payment found to verify.");
            }
        };

        verifyPayment();
    }, [navigate]);

    return (
        <div style={{ padding: "50px", textAlign: "center", color: "white" }}>
            <h2>Khalti Payment Status</h2>
            <p>{status}</p>
        </div>
    );
};

export default PaymentSuccess;
