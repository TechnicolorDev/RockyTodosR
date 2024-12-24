import React, { useState, useEffect } from 'react';
import { FaCheck, FaTimes} from 'react-icons/fa';

const CheckRequirements: React.FC = () => {
    const [checkResults, setCheckResults] = useState({
        node: false,
        nginx: false,
        redis: false,
        mysql: false,
    });

    const [formData, setFormData] = useState({
        appUrl: '',
        redis: {
            host: '',
            port: '',
            password: '',
        },
        dbType: 'mysql',
        mysqlConfig: {
            host: '',
            port: '',
            username: '',
            password: '',
        },
    });

    const [currentStep, setCurrentStep] = useState(1);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setCheckResults({
                node: true,
                nginx: true,
                redis: true,
                mysql: true,
            });
        }, 1000);

        return () => clearTimeout(timeout);
    }, []);

    const handleNext = () => {
        if (currentStep < 4) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleRedisChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            redis: {
                ...prevState.redis,
                [name]: value,
            },
        }));
    };

    return (
        <div className="install-wrapper">
            <div className="installer-bg">
                <div className="check-requirements-container">
                    <div className="progress-bar-container">
                        {[1, 2, 3, 4].map((step) => (
                            <div
                                key={step}
                                className={`progress-bar-wrapper ${currentStep >= step ? 'active' : 'pending'}`}
                            >
                                <div className="progress-bar">
                                    <div className={`progress ${currentStep >= step ? 'active' : 'pending'}`} />
                                    <span className="step-number">{step}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <ul className="check-requirements-list">
                        <li className={`check-item ${checkResults.node ? 'success' : 'error'}`}>
                            {checkResults.node ? <FaCheck className="checkmark"/> : <FaTimes className="x-icon"/>} Node.js
                            <p className="isntalled-p">NodeJS version 20 or higher</p>
                        </li>
                        <li className={`check-item ${checkResults.nginx ? 'success' : 'error'}`}>
                            {checkResults.node ? <FaCheck className="checkmark"/> : <FaTimes className="x-icon"/>} Nginx
                            <p className="isntalled-p">Nginx 1.26 or higer</p>
                        </li>
                        <li className={`check-item ${checkResults.redis ? 'success' : 'error'}`}>
                            {checkResults.node ? <FaCheck className="checkmark"/> : <FaTimes className="x-icon"/>} Redis
                            <p className="isntalled-p">Redis 8.0 or higher</p>
                        </li>
                        <li className={`check-item ${checkResults.mysql ? 'success' : 'error'}`}>
                            {checkResults.node ? <FaCheck className="checkmark"/> : <FaTimes className="x-icon"/>} MySQL
                            <p className="isntalled-p">MySQL 9.0.0 or higer || MariaDB 11.6.2 or higher</p>
                        </li>
                    </ul>
                    <div className="btn-install-container">
                        {currentStep > 1 && (
                            <button className="btn-next" onClick={handleBack}>
                                Back
                            </button>
                        )}
                        {currentStep < 4 && (
                            <button className="btn-next" onClick={handleNext}>
                                Next
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckRequirements;
