import React from 'react';
import PropTypes from 'prop-types';

export const ViewContext = React.createContext();

export const ViewProvider = ({ children, value }) => (
  <ViewContext.Provider value={value}>{children}</ViewContext.Provider>
);

ViewProvider.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
    PropTypes.string
  ]).isRequired,
  value: PropTypes.arrayOf(
    PropTypes.shape({
      state: PropTypes.any,
      dispatch: PropTypes.func
    })
  )
};

ViewProvider.defaultProps = {
  value: {}
};

export const useView = () => React.useContext(ViewContext);
