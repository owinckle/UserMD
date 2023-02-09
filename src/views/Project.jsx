import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";

import "../assets/styles/project.scss";

import Sidebar from "../components/Sidebar";
import { supabase } from "../supbaseClient";
import AppContext from "../contexts/AppContext";
import ModalContext from "../contexts/ModalContext";

const Project = () => {
	const { appKey } = useContext(AppContext);
	const { openNewPageModal } = useContext(ModalContext);
	const { projectId } = useParams();

	const [project, setProject] = useState(null);
	const [pages, setPages] = useState([]);
	const [currentPageId, setCurrentPageId] = useState(null);
	const [markdown, setMarkdown] = useState("");
	const [previewMode, setPreviewMode] = useState(false);

	useEffect(() => {
		getProject();
		getPages();
	}, [projectId, appKey]);

	const getProject = async () => {
		const { data, error } = await supabase
			.from("projects")
			.select(`id, name`)
			.eq("id", projectId);

		setProject(data[0]);
	};

	const getPages = async () => {
		const { data, error } = await supabase
			.from("pages")
			.select(`id, name, content`)
			.eq("project", projectId);
		setPages(data);

		if (data.length != 0) {
			setCurrentPageId(data[0].id);
			setMarkdown(data[0].content);
		}
	};

	const selectPage = (pageId) => {
		setCurrentPageId(pageId);
		setMarkdown(pages.find((page) => page.id === parseInt(pageId)).content);
	};

	return (
		<div className="app-container">
			<Sidebar />

			<div className="app-content project">
				<div className="project__main-container">
					<div className="project__header">
						<div className="flex flex-col">
							<div className="title-bottom-space">
								{project ? project.name : "..."}
							</div>
							<Link
								to="https://docs.domain.com"
								target="_blank"
								className="text-sub flex items-center"
							>
								docs.domain.com
							</Link>
						</div>
						{pages.length !== 0 ? (
							<div className="flex gap">
								<select
									onChange={(e) => selectPage(e.target.value)}
								>
									{pages.map((page) => (
										<option key={page.id} value={page.id}>
											{page.name}
										</option>
									))}
								</select>
								<button
									onClick={() => openNewPageModal(project.id)}
								>
									New page
								</button>
							</div>
						) : null}
					</div>

					{pages.length !== 0 ? (
						<>
							<ProjectEditor
								markdown={markdown}
								setMarkdown={setMarkdown}
								previewMode={previewMode}
							/>
							<ControlBar
								previewMode={previewMode}
								togglePreviewMode={() =>
									setPreviewMode(!previewMode)
								}
							/>
						</>
					) : (
						<div className="project__no-pages center">
							<div className="text-sub">
								Create your first page to get started
							</div>
							<button
								className="center-x"
								onClick={() => openNewPageModal(project.id)}
							>
								Create
							</button>
						</div>
					)}
				</div>
				<ProjectSidebar
					project={project}
					page={pages.find((page) => page.id === currentPageId)}
				/>
			</div>
		</div>
	);
};

const ControlBar = ({ previewMode, togglePreviewMode }) => {
	return (
		<div className="project__control-bar">
			<div className="text-sub">Saved at 4:53pm</div>
			<div className="project__control-bar__controls">
				<button
					onClick={togglePreviewMode}
					className={previewMode ? "" : " transparent"}
				>
					Preview
				</button>
				<button>Save</button>
			</div>
		</div>
	);
};

const ProjectEditor = ({ markdown, setMarkdown, previewMode }) => {
	return (
		<div
			className={
				"project__editor" +
				(previewMode ? " project__editor--preview" : "")
			}
		>
			{previewMode ? (
				<ReactMarkdown
					children={markdown}
					components={{
						code({ node, inline, className, children, ...props }) {
							const match = /language-(\w+)/.exec(
								className || ""
							);
							return !inline && match ? (
								<SyntaxHighlighter
									children={String(children).replace(
										/\n$/,
										""
									)}
									style={atomDark}
									language={match[1]}
									PreTag="div"
									{...props}
								/>
							) : (
								<code className={className} {...props}>
									{children}
								</code>
							);
						},
					}}
				/>
			) : (
				<textarea
					placeholder="Start writing your markdown page here..."
					value={markdown}
					onChange={(e) => setMarkdown(e.target.value)}
				></textarea>
			)}
		</div>
	);
};

const ProjectSidebar = ({ project, page }) => {
	return (
		<div className="project__sidebar">
			<div className="project__sidebar__section">
				<div className="project__sidebar__section__name">
					Project settings
				</div>
				<div className="project__sidebar__input">
					<label>Project name</label>
					<input type="text" value={project.name} />
				</div>
			</div>
			<div className="project__sidebar__section">
				<div className="project__sidebar__section__name">
					Page settings
				</div>
				<div className="project__sidebar__input">
					<label>Page name</label>
					<input type="text" value={page.name} />
				</div>
			</div>
		</div>
	);
};

export default Project;
