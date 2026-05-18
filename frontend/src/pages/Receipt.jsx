import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import jsPDF from "jspdf";

function Receipt() {
  const { state } = useLocation();

  const ride = state?.ride;

  const downloadReceipt = () => {
  const pdf = new jsPDF();

  const distance = Number(ride.distance || 0);
  const baseFare = 50;
  const perKmRate = 12;
  const distanceCharge = Math.round(distance * perKmRate);

  pdf.setFontSize(22);
  pdf.text("RideSnap Receipt", 70, 20);

  pdf.setFontSize(14);

  pdf.text(`Passenger: ${ride.user?.name}`, 20, 50);
  pdf.text(`Pickup: ${ride.pickupLocation}`, 20, 65);
  pdf.text(`Drop: ${ride.dropLocation}`, 20, 80);
  pdf.text(`Distance: ${distance.toFixed(2)} km`, 20, 95);
  pdf.text(`Driver: ${ride.driverName}`, 20, 65);
pdf.text(`Vehicle: ${ride.vehicleNumber}`, 20, 80);
pdf.text(`Cab Type: ${ride.cabType}`, 20, 95);

  pdf.text(`Base Fare: ₹${baseFare}`, 20, 120);
  pdf.text(`Distance Charge: ₹${distanceCharge}`, 20, 135);
  pdf.text(`Total Fare: ₹${ride.fare}`, 20, 150);

  pdf.text(
    `Date: ${new Date(ride.updatedAt).toLocaleDateString()}`,
    20,
    175
  );

  pdf.text(
    `Time: ${new Date(ride.updatedAt).toLocaleTimeString()}`,
    20,
    190
  );

  pdf.save("RideSnap_Receipt.pdf");
};

  if (!ride) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <Navbar />
        <div className="p-10 text-center">
          No receipt found
        </div>
      </div>
    );
  }

  const date = new Date(ride.updatedAt);

  return (
    <div className="min-h-screen bg-white text-black dark:bg-slate-950 dark:text-white">
      <Navbar />

      <div className="flex justify-center items-center py-10 px-4">
        <div className="bg-white text-black rounded-3xl shadow-2xl w-full max-w-2xl p-10">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold">
              Ride Receipt
            </h1>

            <p className="text-gray-500 mt-2">
              RideSnap Invoice
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 text-lg">
            <div>
              <p>
                <strong>Passenger:</strong>{" "}
                {ride.user?.name}
              </p>

              <p>
  <strong>Driver:</strong> {ride.driverName}
</p>

<p>
  <strong>Vehicle:</strong> {ride.vehicleNumber}
</p>

<p>
  <strong>Cab Type:</strong> {ride.cabType}
</p>

              <p>
                <strong>Pickup:</strong>{" "}
                {ride.pickupLocation}
              </p>

              <p>
                <strong>Drop:</strong>{" "}
                {ride.dropLocation}
              </p>

              <p>
                <strong>Status:</strong>{" "}
                {ride.status}
              </p>
            </div>

            <div>
              <p>
                <strong>Date:</strong>{" "}
                {date.toLocaleDateString()}
              </p>

              <p>
                <strong>Time:</strong>{" "}
                {date.toLocaleTimeString()}
              </p>

              <p>
                <strong>Distance:</strong>{" "}
                {Number(ride.distance||0).toFixed(2)} km
              </p>
            </div>
          </div>

          

          <div className="mt-10 border-t pt-6">
  <h2 className="text-2xl font-bold mb-5">
    Fare Breakdown
  </h2>

  {(() => {
    const distance = Number(ride.distance || 0);
    const baseFare = 50;
    const perKmRate = 12;
    const distanceCharge = Math.round(distance * perKmRate);

    return (
      <div className="space-y-3 text-lg">
        <div className="flex justify-between">
          <span>Base Fare</span>
          <span>₹{baseFare}</span>
        </div>

        <div className="flex justify-between">
          <span>
            Distance Charge ({distance.toFixed(2)} × ₹{perKmRate})
          </span>
          <span>
            ₹{distanceCharge}
          </span>
        </div>

        <div className="flex justify-between font-bold text-2xl border-t pt-4">
          <span>Total Fare</span>
          <span>₹{ride.fare}</span>
        </div>
      </div>
    );
  })()}
</div>

          <div className="mt-10 text-center text-green-600 font-bold text-xl">
            Payment Successful
          </div>

          <button
  onClick={downloadReceipt}
  className="mt-6 bg-blue-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-400 transition"
>
  Download PDF Receipt
</button>

        </div>
      </div>
    </div>
  );
}

export default Receipt;