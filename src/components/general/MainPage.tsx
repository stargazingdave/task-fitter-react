import { useAuth, useSigninCheck } from "reactfire";
import { Project } from "../projects/Project";
import { Projects } from "../projects/Projects";
import { DocumentData } from "firebase/firestore";
import { useState } from "react";
import { ContactList } from "../contacts/ContactList";
import './MainPage.scss';
import { useAppDispatch, useAppSelector } from "../../reduxHooks";
import { selectSignedIn } from "../../redux/userSlice";
import { selectOpenContacts } from "../../redux/contactsSlice";
import { selectProjectStack, setProjectStack } from "../../redux/projectsSlice";
import { selectMenuOpen } from "../../redux/userSettingsSlice";
import { Menu } from "./Menu";

type MainPageProps = {
}


export const MainPage = (props: MainPageProps) => {
    const openContacts = useAppSelector(selectOpenContacts);
    const menuOpen = useAppSelector(selectMenuOpen);
    const projectStack = useAppSelector(selectProjectStack);
    const dispatch = useAppDispatch();
    //const [projectStack, setProjectStack] = useState([] as DocumentData[]);
    const [editProject, setEditProject] = useState({} as DocumentData);
    const signedIn = useAppSelector(selectSignedIn);
    
    const { status, data: signInCheckResult } = useSigninCheck();
    if (status === 'loading') {
      return <span>loading...</span>;
    }
    
    if (signInCheckResult.signedIn && signedIn) {
      return (
        <div className="main-page">
            {
                menuOpen &&
                <Menu />
            }
            {
                projectStack.length != 0
                ? <Project 
                    editProject={editProject}
                    setEditProject={(editProject) => setEditProject(editProject)}
                />
                : <Projects 
                    editProject={editProject}
                    setEditProject={(editProject) => setEditProject(editProject)}
                /> 
            }
        {
            openContacts &&
            <ContactList />
        }
        </div>
      
    );
  }
  else {
    return null;
  }
}