import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
} from "@chakra-ui/react";

// importing components
import FormPage from "./FormPage";
import Loading from "../hooks/Loading";

// importing assests
import ProductImage from "../assets/ProductImage.jpg";

// importing styles
import '../styles/subprocess.css'

function SubProcess({ isOpen, onClose, data, loading }) {
  if (!data?.nestedProcess) return null;

  // Transform the nested process for FormPage
  const nested = {
    process: data.nestedProcess.process,
    header: data.nestedProcess.headers,
    value: data.nestedProcess.data.map((row) =>
      row.items.map((cell) => ({
        key: cell.key,
        value: cell.value,
        process: cell.process || null,
      }))
    ),
  };

  switch (nested.process) {
    case 'Product Validation Report':
      console.log(nested)
      return (
        <Modal isOpen={isOpen} onClose={onClose} size="4xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>{nested.process}</ModalHeader>
            <ModalCloseButton/>
            {nested.value.map((row, rowIndex) => (
              <ModalBody key={rowIndex}>
                <div
                  className="ProductValidationReportContainer"
                >
                  {/* Show the TEST NAME as title */}
                  <h2>
                    {row.find((item) => item.key === "TEST NAME")?.value}
                  </h2>

                  {/* Show all key/value pairs */}
                  <div className="ProductValidationReportContent">
                    <div className="ProductValidationReportDetails">
                      {row.map((item, colIndex) => (
                        <div key={colIndex}>
                          {item.key === 'IMAGE' || item.key === 'SL.NO' ? null : <span><strong>{item.key}:</strong> {item.value}</span>}
                        </div>
                      ))}
                    </div>
                    <div>
                      <img
                        src={ProductImage || row.find((item) => item.key === "IMAGE")?.value}
                        alt={row.find((item) => item.key === "TEST NAME")?.value}
                        className="ProductValidationReportImage"
                      />
                    </div>
                  </div>
                </div>
              </ModalBody>
            ))}
          </ModalContent>
        </Modal>
      )

    default:
      return (
        <Modal isOpen={isOpen} onClose={onClose} size="6xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>{nested.process}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              { loading 
                  ? <Loading /> : 
                  <FormPage process={nested} />
              }
            </ModalBody>
          </ModalContent>
        </Modal>
      );
  }
}

export default SubProcess;
