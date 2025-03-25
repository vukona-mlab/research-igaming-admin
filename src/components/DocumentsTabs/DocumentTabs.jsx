import React, { useState } from 'react';
import styles from './DocumentTabs.module.css'; 


  const HeaderTabs = ({ tabOne, tabTwo, tabThree, tabFour, handleTabChange }) => {
    const [currentTab, setCurrentTab] = useState(tabOne);
  
    return (
      <div className={styles.documentsHeader}>
        <div
          className={
            currentTab === tabOne
              ? `${styles.tbhTab} ${styles.currentTab}`
              : styles.tbhTab
          }
          onClick={() => {
            setCurrentTab(tabOne);
            handleTabChange(tabOne);
          }}
        >
          {tabOne}
        </div>
  
        <div
          className={
            currentTab === tabTwo
              ? `${styles.tbhTab} ${styles.currentTab}`
              : styles.tbhTab
          }
          onClick={() => {
            setCurrentTab(tabTwo);
            handleTabChange(tabTwo);
          }}
        >
          {tabTwo}
        </div>
  
        <div
          className={
            currentTab === tabThree
              ? `${styles.tbhTab} ${styles.currentTab}`
              : styles.tbhTab
          }
          onClick={() => {
            setCurrentTab(tabThree);
            handleTabChange(tabThree);
          }}
        >
          {tabThree}
        </div>
  
        <div
          className={
            currentTab === tabFour
              ? `${styles.tbhTab} ${styles.currentTab}`
              : styles.tbhTab
          }
          onClick={() => {
            setCurrentTab(tabFour);
            handleTabChange(tabFour);
          }}
        >
          {tabFour}
        </div>
      </div>
    );
  };

export default HeaderTabs;
