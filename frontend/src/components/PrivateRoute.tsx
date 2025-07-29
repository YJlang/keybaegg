import React, {JSX} from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../auth/token';

interface PrivateRouteProps {
    children: JSX.Element;  // React.ReactNode도 가능하지만 React Router는 JSX.Element를 요구하는 경우가 많음
}

const PrivateRoute = ({ children }: PrivateRouteProps): JSX.Element | null => {
    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

export default PrivateRoute;
