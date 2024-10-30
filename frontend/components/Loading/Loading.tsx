// import React from 'react';
// import styles from './Loading.module.css'; // Ensure the CSS file is correctly imported

// const Loading: React.FC = () => {
//   return (
//     <div className={styles.loaderWrapper}>
//       {/* Use an <img> tag to display the GIF */}
//       <img
//         src="/videos/Color Palette.gif" // Ensure the path is correct
//         alt="Loading..."
//         className={styles.loadingGif} // Add any additional styling if necessary
//       />
//       {/* Heading below the GIF with corrected gradient text */}
//       <h1
//         className={styles.heading}
//         style={{
//           background: `linear-gradient(45deg, 
//             rgba(255, 0, 0, 0.8) 0%,    /* Light Red */
//             rgba(0, 0, 255, 0.8) 15%,   /* Light Blue */
//             rgba(255, 255, 0, 0.8) 30%, /* Light Yellow */
//             rgba(0, 128, 0, 0.8) 75%    /* Light Green */
//           )`,
//           backgroundClip: 'text',
//           WebkitBackgroundClip: 'text', // For WebKit browsers
//           color: 'transparent', // Hide the original color
//           WebkitTextFillColor: 'transparent', // WebKit browsers compatibility
//           fontWeight:'bold'
//         }}
//       >
//         Rockstar Color Visualiser
//       </h1>
//     </div>
//   );
// };

// export default Loading;


import React, { useEffect } from 'react';
import styles from './Loading.module.css'; // Ensure the CSS file is correctly imported

const Loading: React.FC = ({message='Rockstar Color Visualiser'}:any) => {
  // Disable scrollbar when loader is shown
  useEffect(() => {
    document.body.style.overflow = 'hidden'; // Disable scroll
    return () => {
      document.body.style.overflow = ''; // Enable scroll when unmounted
    };
  }, []);

  return (
    <div className={styles.loaderWrapper}>
      {/* Video/GIF centered as a loader */}
      <img
        src="/videos/Color Palette.gif" // Ensure the path is correct
        alt="Loading..."
        className={styles.loadingGif} // Add additional styling if necessary
      />
      {/* Heading below the GIF with gradient text */}
      <h1
        className={styles.heading}
        style={{
          background: `linear-gradient(45deg, 
            rgba(255, 0, 0, 0.8) 0%,    /* Light Red */
            rgba(0, 0, 255, 0.8) 15%,   /* Light Blue */
            rgba(255, 255, 0, 0.8) 30%, /* Light Yellow */
            rgba(0, 128, 0, 0.8) 75%    /* Light Green */
          )`,
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text', // For WebKit browsers
          color: 'transparent', // Hide the original color
          WebkitTextFillColor: 'transparent', // WebKit browsers compatibility
          fontWeight: 'bold',
        }}
      >
        {message}
      </h1>
    </div>
  );
};

export default Loading;

