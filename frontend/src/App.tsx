import { gql } from "@apollo/client";
import { useQuery, useMutation } from "@apollo/client/react";
import { useState } from "react";

/* =======================
   GRAPHQL
======================= */

const GET_ORGANIZATIONS = gql`
  query GetOrganizations {
    organizations {
      id
      name
      slug
      projects {
        id
        name
        status
        tasks {
          id
          title
          status
          comments {
            id
            content
          }
        }
      }
    }
  }
`;

const CREATE_PROJECT = gql`
  mutation CreateProject($organizationSlug: String!, $name: String!) {
    createProject(organizationSlug: $organizationSlug, name: $name) {
      project {
        id
        name
        status
      }
    }
  }
`;

const CREATE_TASK = gql`
  mutation CreateTask($projectId: ID!, $title: String!) {
    createTask(projectId: $projectId, title: $title) {
      task {
        id
        title
        status
      }
    }
  }
`;

const UPDATE_TASK_STATUS = gql`
  mutation UpdateTaskStatus($taskId: ID!, $status: String!) {
    updateTaskStatus(taskId: $taskId, status: $status) {
      task {
        id
        status
      }
    }
  }
`;

const CREATE_COMMENT = gql`
  mutation CreateComment($taskId: ID!, $content: String!) {
    createComment(taskId: $taskId, content: $content) {
      comment {
        id
        content
      }
    }
  }
`;

const DELETE_COMMENT = gql`
  mutation DeleteComment($commentId: ID!) {
    deleteComment(commentId: $commentId) {
      success
      taskId
    }
  }
`;

/* =======================
   APP
======================= */

export default function App() {
  const { data, loading, error } = useQuery(GET_ORGANIZATIONS);

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [newProjectName, setNewProjectName] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});

  const [createProject] = useMutation(CREATE_PROJECT, {
    update(cache, { data }) {
      if (!data?.createProject?.project) return;
      
      const newProject = data.createProject.project;
      const existingData: any = cache.readQuery({ query: GET_ORGANIZATIONS });
      
      if (existingData) {
        cache.writeQuery({
          query: GET_ORGANIZATIONS,
          data: {
            organizations: existingData.organizations.map((org: any) => 
              org.projects.some((p: any) => p.id === newProject.id)
                ? org
                : {
                    ...org,
                    projects: [...org.projects, { ...newProject, tasks: [] }]
                  }
            )
          }
        });
      }
    }
  });

  const [createTask] = useMutation(CREATE_TASK, {
    update(cache, { data }) {
      if (!data?.createTask?.task) return;
      
      const newTask = data.createTask.task;
      const existingData: any = cache.readQuery({ query: GET_ORGANIZATIONS });
      
      if (existingData) {
        cache.writeQuery({
          query: GET_ORGANIZATIONS,
          data: {
            organizations: existingData.organizations.map((org: any) => ({
              ...org,
              projects: org.projects.map((project: any) => 
                project.id === selectedProjectId
                  ? {
                      ...project,
                      tasks: project.tasks.some((t: any) => t.id === newTask.id)
                        ? project.tasks
                        : [...project.tasks, { ...newTask, comments: [] }]
                    }
                  : project
              )
            }))
          }
        });
      }
    }
  });

  const [updateTaskStatus] = useMutation(UPDATE_TASK_STATUS, {
    optimisticResponse: ({ taskId, status }) => ({
      updateTaskStatus: {
        __typename: 'UpdateTaskStatusPayload',
        task: {
          __typename: 'Task',
          id: taskId,
          status: status
        }
      }
    }),
    update(cache, { data }) {
      if (!data?.updateTaskStatus?.task) return;
      
      const updatedTask = data.updateTaskStatus.task;
      const existingData: any = cache.readQuery({ query: GET_ORGANIZATIONS });
      
      if (existingData) {
        cache.writeQuery({
          query: GET_ORGANIZATIONS,
          data: {
            organizations: existingData.organizations.map((org: any) => ({
              ...org,
              projects: org.projects.map((project: any) => ({
                ...project,
                tasks: project.tasks.map((task: any) => 
                  task.id === updatedTask.id
                    ? { ...task, status: updatedTask.status }
                    : task
                )
              }))
            }))
          }
        });
      }
    }
  });

  const [createComment] = useMutation(CREATE_COMMENT, {
    update(cache, { data }) {
      if (!data?.createComment?.comment) return;
      
      const newComment = data.createComment.comment;
      const existingData: any = cache.readQuery({ query: GET_ORGANIZATIONS });
      
      if (existingData) {
        // Find which task to add comment to by checking commentInputs
        let targetTaskId: string | null = null;
        for (const taskId in commentInputs) {
          if (commentInputs[taskId]) {
            targetTaskId = taskId;
            break;
          }
        }
        
        if (targetTaskId) {
          cache.writeQuery({
            query: GET_ORGANIZATIONS,
            data: {
              organizations: existingData.organizations.map((org: any) => ({
                ...org,
                projects: org.projects.map((project: any) => ({
                  ...project,
                  tasks: project.tasks.map((task: any) => 
                    task.id === targetTaskId
                      ? {
                          ...task,
                          comments: task.comments.some((c: any) => c.id === newComment.id)
                            ? task.comments
                            : [...task.comments, newComment]
                        }
                      : task
                  )
                }))
              }))
            }
          });
        }
      }
    }
  });

  const [deleteComment] = useMutation(DELETE_COMMENT, {
    onError: (error) => {
      console.error('Delete comment error:', error);
      alert(`Failed to delete comment: ${error.message}`);
    },
    onCompleted: (data) => {
      console.log('Comment deleted successfully:', data);
    },
    update(cache, { data }, { variables }) {
      if (!data?.deleteComment?.success) return;
      
      const taskId = data.deleteComment.taskId;
      const commentId = variables?.commentId;
      
      if (!taskId || !commentId) return;
      
      const existingData: any = cache.readQuery({ query: GET_ORGANIZATIONS });
      if (!existingData) return;
      
      cache.writeQuery({
        query: GET_ORGANIZATIONS,
        data: {
          organizations: existingData.organizations.map((org: any) => ({
            ...org,
            projects: org.projects.map((project: any) => ({
              ...project,
              tasks: project.tasks.map((task: any) => 
                task.id === taskId
                  ? {
                      ...task,
                      comments: task.comments.filter((c: any) => c.id !== commentId)
                    }
                  : task
              )
            }))
          }))
        }
      });
    }
  });

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent mb-4"></div>
          <p className="text-slate-300 text-lg font-light tracking-wide">Loading dashboard</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 backdrop-blur-sm">
          <p className="text-red-400 text-lg">{error.message}</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Clash+Display:wght@400;500;600;700&family=Instrument+Sans:wght@400;500;600&display=swap');
        
        * {
          font-family: 'Instrument Sans', system-ui, -apple-system, sans-serif;
        }
        
        h1, h2, h3, .display-font {
          font-family: 'Clash Display', system-ui, sans-serif;
        }

        .glass-card {
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(148, 163, 184, 0.1);
        }

        .glass-input {
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(148, 163, 184, 0.15);
          transition: all 0.3s ease;
        }

        .glass-input:focus {
          background: rgba(15, 23, 42, 0.6);
          border-color: rgba(251, 191, 36, 0.5);
          box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.1);
        }

        .project-card {
          position: relative;
          overflow: hidden;
        }

        .project-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #f59e0b, #eab308);
          transform: scaleX(0);
          transition: transform 0.3s ease;
        }

        .project-card.selected::before {
          transform: scaleX(1);
        }

        .task-card {
          animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .btn-primary {
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .btn-primary::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          transform: translate(-50%, -50%);
          transition: width 0.6s, height 0.6s;
        }

        .btn-primary:hover::before {
          width: 300px;
          height: 300px;
        }

        .comment-slide {
          animation: slideDown 0.3s ease-out;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            max-height: 0;
          }
          to {
            opacity: 1;
            max-height: 500px;
          }
        }

        .status-badge {
          position: relative;
          overflow: hidden;
        }

        .status-badge::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
          transform: rotate(45deg);
          animation: shimmer 3s infinite;
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
          100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
        }
      `}</style>

      {/* HEADER */}
      <header className="glass-card border-0 border-b border-slate-700/50 px-8 py-8 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">
              Project Hub
            </h1>
            <p className="text-slate-400 mt-2 text-sm tracking-wide">
              Orchestrate your workflow with precision
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-sm text-slate-400">Live</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8 space-y-16">
        {data.organizations.map((org: any, orgIndex: number) => (
          <section 
            key={org.id}
            style={{ animationDelay: `${orgIndex * 100}ms` }}
            className="animate-fadeIn"
          >
            {/* ORG HEADER */}
            <div className="mb-8">
              <h2 className="text-3xl font-semibold text-slate-100 mb-2">{org.name}</h2>
              <div className="h-1 w-24 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full"></div>
            </div>

            {/* CREATE PROJECT */}
            <div className="glass-card rounded-2xl p-6 mb-8">
              <div className="flex gap-4 items-center">
                <input
                  className="glass-input rounded-xl px-6 py-4 flex-1 text-slate-100 placeholder-slate-500 outline-none"
                  placeholder="Enter new project name..."
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newProjectName) {
                      createProject({
                        variables: {
                          organizationSlug: org.slug,
                          name: newProjectName,
                        },
                      });
                      setNewProjectName("");
                    }
                  }}
                />
                <button
                  className="btn-primary bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 px-8 py-4 rounded-xl font-semibold text-slate-900 shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!newProjectName}
                  onClick={() => {
                    if (!newProjectName) return;
                    createProject({
                      variables: {
                        organizationSlug: org.slug,
                        name: newProjectName,
                      },
                    });
                    setNewProjectName("");
                  }}
                >
                  Create Project
                </button>
              </div>
            </div>

            {/* PROJECT GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {org.projects.map((project: any, index: number) => (
                <div
                  key={project.id}
                  onClick={() => setSelectedProjectId(project.id)}
                  style={{ animationDelay: `${index * 50}ms` }}
                  className={`project-card glass-card cursor-pointer rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-amber-500/10 task-card
                    ${
                      selectedProjectId === project.id
                        ? "selected ring-2 ring-amber-500/50 shadow-xl shadow-amber-500/20"
                        : ""
                    }`}
                >
                  <div className="font-semibold text-lg mb-4 text-slate-100">{project.name}</div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`status-badge inline-flex items-center text-xs font-medium px-4 py-2 rounded-full
                        ${
                          project.status === "COMPLETED"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : project.status === "ACTIVE"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : "bg-slate-500/20 text-slate-300 border border-slate-500/30"
                        }`}
                    >
                      {project.status}
                    </span>
                    <div className="text-slate-400 text-sm">
                      {project.tasks.length} {project.tasks.length === 1 ? 'task' : 'tasks'}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* TASK PANEL */}
            {org.projects
              .filter((p: any) => p.id === selectedProjectId)
              .map((project: any) => (
                <div
                  key={project.id}
                  className="glass-card rounded-3xl p-8 shadow-2xl"
                >
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-semibold text-slate-100">Task Management</h3>
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <div className="h-2 w-2 rounded-full bg-amber-500"></div>
                      {project.tasks.filter((t: any) => t.status !== 'DONE').length} active
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    {project.tasks.map((task: any, taskIndex: number) => (
                      <div
                        key={task.id}
                        style={{ animationDelay: `${taskIndex * 50}ms` }}
                        className="task-card glass-card rounded-xl p-6 border border-slate-700/50 hover:border-amber-500/30 transition-all duration-300"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className={`font-medium text-lg ${task.status === 'DONE' ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                              {task.title}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`text-xs font-medium px-3 py-1 rounded-full
                              ${task.status === 'DONE' 
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                                : 'bg-slate-600/30 text-slate-300 border border-slate-600/30'
                              }`}>
                              {task.status}
                            </span>
                          </div>
                        </div>

                        {task.status !== "DONE" && (
                          <button
                            className="mt-2 text-sm text-amber-400 hover:text-amber-300 font-medium transition-colors duration-200 flex items-center gap-2 group"
                            onClick={() =>
                              updateTaskStatus({
                                variables: {
                                  taskId: task.id,
                                  status: "DONE",
                                },
                              })
                            }
                          >
                            <span className="inline-block group-hover:scale-110 transition-transform">✓</span>
                            Mark as complete
                          </button>
                        )}

                        {/* COMMENTS */}
                        <div className="mt-4 pt-4 border-t border-slate-700/50">
                          <button
                            className="text-sm text-slate-400 hover:text-amber-400 font-medium transition-colors duration-200 flex items-center gap-2"
                            onClick={() =>
                              setOpenComments((prev) => ({
                                ...prev,
                                [task.id]: !prev[task.id],
                              }))
                            }
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            {task.comments.length} {task.comments.length === 1 ? 'comment' : 'comments'}
                          </button>

                          {openComments[task.id] && (
                            <div className="comment-slide mt-4 space-y-3">
                              {task.comments.map((c: any) => (
                                <div
                                  key={c.id}
                                  className="text-sm bg-slate-900/60 border border-slate-700/30 rounded-xl px-4 py-3 text-slate-300 flex items-start justify-between gap-3 group"
                                >
                                  <div className="flex-1">{c.content}</div>
                                  <button
                                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-all duration-200 flex-shrink-0"
                                    onClick={() => {
                                      if (window.confirm('Are you sure you want to delete this comment?')) {
                                        deleteComment({
                                          variables: {
                                            commentId: c.id,
                                          },
                                        });
                                      }
                                    }}
                                    title="Delete comment"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </div>
                              ))}

                              <div className="flex gap-3 mt-4">
                                <input
                                  className="flex-1 glass-input rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none"
                                  placeholder="Add a comment..."
                                  value={commentInputs[task.id] || ""}
                                  onChange={(e) =>
                                    setCommentInputs({
                                      ...commentInputs,
                                      [task.id]: e.target.value,
                                    })
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && commentInputs[task.id]) {
                                      createComment({
                                        variables: {
                                          taskId: task.id,
                                          content: commentInputs[task.id],
                                        },
                                      });
                                      setCommentInputs({
                                        ...commentInputs,
                                        [task.id]: "",
                                      });
                                    }
                                  }}
                                />
                                <button
                                  className="bg-gradient-to-r from-slate-700 to-slate-600 hover:from-amber-500 hover:to-yellow-500 px-5 rounded-xl text-sm font-medium transition-all duration-300 disabled:opacity-50"
                                  disabled={!commentInputs[task.id]}
                                  onClick={() => {
                                    if (!commentInputs[task.id]) return;
                                    createComment({
                                      variables: {
                                        taskId: task.id,
                                        content: commentInputs[task.id],
                                      },
                                    });
                                    setCommentInputs({
                                      ...commentInputs,
                                      [task.id]: "",
                                    });
                                  }}
                                >
                                  Post
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* CREATE TASK */}
                  <div className="glass-card rounded-2xl p-6 border border-amber-500/20">
                    <div className="flex gap-4">
                      <input
                        className="flex-1 glass-input rounded-xl px-6 py-4 text-slate-100 placeholder-slate-500 outline-none"
                        placeholder="Describe a new task..."
                        value={taskTitle}
                        onChange={(e) => setTaskTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && taskTitle) {
                            createTask({
                              variables: {
                                projectId: project.id,
                                title: taskTitle,
                              },
                            });
                            setTaskTitle("");
                          }
                        }}
                      />
                      <button
                        className="btn-primary bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 px-8 py-4 rounded-xl font-semibold text-slate-900 shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!taskTitle}
                        onClick={() => {
                          if (!taskTitle) return;
                          createTask({
                            variables: {
                              projectId: project.id,
                              title: taskTitle,
                            },
                          });
                          setTaskTitle("");
                        }}
                      >
                        Add Task
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </section>
        ))}
      </main>
    </div>
  );
}