import React from 'react'

function DepartmentDashboard({ Content }) {

    const renderContent = () => {
        switch(Content) {
            case 'Design':
                return (
                    <div>
                        <h1>Design</h1>
                    </div>
                )
            case 'Manufacturing':
                return (
                    <div>
                        <h1>Manufacturing</h1>
                    </div>
                )
            case 'Quality':
                return (
                    <div>
                        <h1>Quality</h1>
                    </div>
                )
            case 'Maintenance':
                return (
                    <div>
                        <h1>Maintenance</h1>
                    </div>
                )
            case 'Sales':
                return (
                    <div>
                        <h1>Sales</h1>
                    </div>
                )
            case 'Purchase':
                return (
                    <div>
                        <h1>Purchase</h1>
                    </div>
                )
            case 'Stores':
                return (
                    <div>
                        <h1>Stores</h1>
                    </div>
                )
            case 'Human Resources':
                return (
                    <div>
                        <h1>Human Resources</h1>
                    </div>
                )
            
            default:
                return (
                    <div>
                        <h1>Nothing as selected</h1>
                    </div>
                )
        }
    }
  return (
    <div>
        {renderContent()}
    </div>
  )
}

export default DepartmentDashboard