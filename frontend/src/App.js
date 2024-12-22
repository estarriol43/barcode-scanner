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
          },
          decoder: {
            readers: ["code_128_reader", "ean_reader"], // Support multiple 1D barcode formats
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
          setServerResponse(`Server Response: ${JSON.stringify(responseData, null, 2)}`);
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
      <h1>Barcode Scanner</h1>
      <div id="scanner" ref={scannerRef}></div>
      <div id="barcode-result">
        Scanned Barcode: <span>{barcode}</span>
      </div>
        {serverResponse && <div className="server-response">{serverResponse}</div>}
    </div>
  );
};

export default BarcodeScanner;
