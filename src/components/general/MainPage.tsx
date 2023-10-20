import { useAuth, useSigninCheck } from "reactfire";
import { Project } from "../projects/Project";
import { Projects } from "../projects/Projects";
import { DocumentData } from "firebase/firestore";
import { useState } from "react";
import { ContactList } from "../contacts/ContactList";
import './MainPage.scss';
import { useAppSelector } from "../../reduxHooks";
import { selectSignedIn } from "../../redux/userSlice";
import { selectOpenContacts } from "../../redux/contactsSlice";

type MainPageProps = {
}


export const MainPage = (props: MainPageProps) => {
    const openContacts = useAppSelector(selectOpenContacts);
    const [projectStack, setProjectStack] = useState([] as DocumentData[]);
    const [editProject, setEditProject] = useState({} as DocumentData);
    const signedIn = useAppSelector(selectSignedIn);
    
    const { status, data: signInCheckResult } = useSigninCheck();
    if (status === 'loading') {
      return <span>loading...</span>;
    }
    
    if (signInCheckResult.signedIn && signedIn) {
      return (
        <>
        <div className="main-page">
        <>
            {
                projectStack.length != 0
                ? <Project 
                    projectStack={projectStack}
                    setProjectStack={setProjectStack}
                    onProjectSelected = {(array: DocumentData[]) => {
                        setProjectStack(array);
                    }} 
                    editProject={editProject}
                    setEditProject={(editProject) => setEditProject(editProject)}
                />
                : <Projects 
                    onProjectSelected = {(array: DocumentData[]) => {
                        setProjectStack(array);
                    }} 
                    projectStack={projectStack}
                    editProject={editProject}
                    setEditProject={(editProject) => setEditProject(editProject)}
                /> 
            }
        </>
        {
            openContacts &&
            <ContactList />
        }
        </div>
      </>
      
    );
  }
  else {
    return null;
  }
}