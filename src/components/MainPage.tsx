import { useSigninCheck } from "reactfire";
import { Project } from "./projects/Project";
import { Projects } from "./projects/Projects";
import { DocumentData } from "firebase/firestore";
import { useState } from "react";
import { User } from "firebase/auth";
import { ContactList } from "./contacts/ContactList";
import './MainPage.scss';

type MainPageProps = {
  user: User;
}


export const MainPage = (props: MainPageProps) => {
    const [projectStack, setProjectStack] = useState([] as DocumentData[]);
    const [editProject, setEditProject] = useState({} as DocumentData);


    const { status, data: signInCheckResult } = useSigninCheck();
    if (status === 'loading') {
      return <span>loading...</span>;
    }
    
    if (signInCheckResult.signedIn === true) {
      return (
        <>
        <div className="main-page">
        <>
            {
                projectStack.length != 0
                ? <Project projectStack={projectStack}
                            setProjectStack={setProjectStack}
                            onProjectSelected = {(array: DocumentData[]) => {
                                setProjectStack(array);
                            }
                            } 
                            editProject={editProject}
                            setEditProject={(editProject) => setEditProject(editProject)}
                            user={props.user} 
                        />
                : <Projects onProjectSelected = {(array: DocumentData[]) => {
                                                    setProjectStack(array);
                                                }
                                                } 
                            user={props.user} 
                            projectStack={projectStack}
                            editProject={editProject}
                            setEditProject={(editProject) => setEditProject(editProject)}
                        /> 
            }
        </>
          {<ContactList user={props.user}/>}
        </div>
      </>
      
    );
  }
  else {
    return null;
  }
}