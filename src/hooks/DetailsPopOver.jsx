import React from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverBody,
  Portal
} from "@chakra-ui/react";
import { Icon } from "@iconify/react";

function DetailsPopOver({ isOpen, onClose, DetailsContent }) {

    const DetailsArray = [
        { label: "Name", value: DetailsContent.userName },
        { label: "Employee ID", value: DetailsContent.employeeId },
        { label: "Role", value: DetailsContent.role },
        { label: "Email", value: DetailsContent.email }
    ]

  return (
    <Popover isOpen={isOpen} onClose={onClose}>
      <PopoverTrigger>
        <Icon icon="mynaui:user" className="HeaderIcon" />
      </PopoverTrigger>
      <Portal>
        <PopoverContent width="280px" boxShadow="dark-lg" borderRadius="md" _focus={{ boxShadow: "none", outline: "none" }}>
          <PopoverArrow />
          <PopoverBody>
            {DetailsContent ? (
              <div className="UserDetailsContainer">
                <div className="UserDetailsHeader">User Details</div>
                  {DetailsArray.map((item, idx) => (
                    <div key={idx} className="UserDetailRow">
                        <span className="UserDetailLabel">{item.label}:</span>
                        <span className="UserDetailValue">{item.value}</span>
                    </div>
                  ))}

                  <div className="UserDetailRow">
                    <span className="UserDetailLabel">Access:</span>
                    <div className="UserAccessList">
                        {DetailsContent.access?.map((item, idx) => (
                            <span key={idx} className="UserAccessItem">{item}</span>
                        ))}
                    </div>
                  </div>
                </div>
            ) : (
              "No details available"
            )}
          </PopoverBody>
        </PopoverContent>
      </Portal>
    </Popover>
  );
}

export default DetailsPopOver;
