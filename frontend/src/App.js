import React, { useEffect, useRef, useState } from "react";
import Quagga from "@ericblade/quagga2";

const BarcodeScanner = () => {
  const scannerRef = useRef(null); // Reference to the scanner container
  const [barcode, setBarcode] = useState("None"); // State for the scanned barcode
  const [serverResponse, setServerResponse] = useState(""); // State for the server response

  useEffect(() => {
    const initializeScanner = () => {
      Quagga.init(
        {
          inputStream: {
            name: "Live",
            type: "LiveStream",
            target: scannerRef.current, // Attach the video feed here
            constraints: {
              height: window.innerWidth * 0.8,
              width: window.innerHeight * 0.8,
              facingMode: "environment",
              advanced: [{ zoom: 1 }] // Adjust the zoom level here
            }
          },
          decoder: {
            readers: ["code_128_reader"], // Support multiple 1D barcode formats
          },
        },
        (err) => {
          if (err) {
            console.error("Error initializing Quagga:", err);
            return;
          }
          Quagga.start();
        }
      );

      Quagga.onDetected(async (data) => {
        const code = data.codeResult.code;
        console.log("Detected barcode:", code);
        setBarcode(code);
        Quagga.stop(); // Stop scanning after detection (optional)

        try {
          // Send the message to the server using POST
          const response = await fetch(process.env.REACT_APP_HOST_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ code }),
          });

          // Display the response from the server
          const responseData = await response.json();
          setServerResponse(responseData);
          console.log(responseData)
          console.log(typeof(responseData))
        } catch (error) {
          setServerResponse(`Error: ${error.message}`);
          console.error("Error sending message:", error);
        }
      });
    };

    initializeScanner();

    return () => {
      // Clean up when the component is unmounted
      Quagga.stop();
      Quagga.offDetected();
    };
  }, []);

  return (
    <div id="scanner-container">
      <div id="barcode-result">
        Scanned Barcode: <span>{barcode}</span>
      </div>
        <div className="server-response">
          Response: {serverResponse.status}
        </div>
      <div id="scanner" ref={scannerRef}></div>
    </div>
  );
};

export default BarcodeScanner;
