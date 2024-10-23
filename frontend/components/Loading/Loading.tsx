import React from 'react';
import styles from './Loading.module.css'; // Load your CSS for the loading screen

const Loading: React.FC = () => {
  return (
    <div className={styles.loaderWrapper}>
      {/* Use an <img> tag to display the GIF */}
      <img
        src="/videos/Color Palette.gif" // Make sure the path is correct
        alt="Loading..."
        className={styles.loadingGif} // Add any styles you need for the GIF
      />
      {/* Heading below the GIF */}
      <h1 className={styles.heading} style={{ color: '#0A9F41' }}>
        Rockstar Color Visualiser
      </h1>
    </div>
  );
};

export default Loading;
