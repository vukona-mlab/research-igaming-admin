import React, { useEffect, useState } from "react";
import Navbar from "../../components/common/NavBar/NavBar";
import Sidebar from "../../components/CMS sidebar/Sidebar";
import { Container } from "react-bootstrap";
import ProjectList from "../../components/ProjectList/ProjectList";
import ProjectTabs from "../../components/common/projectTabs/projectTabs";
import ProjectLists from "../../components/ProjectLists/ProjectLists";
const ProjectPage = () => {
  return (
    <div>
      <ProjectLists />
      {/* <Sidebar/>
            <Container>
            <Navbar/>
            <ProjectTabs/>
            <ProjectList/>
            
           
            </Container> */}
    </div>
  );
};

export default ProjectPage;
