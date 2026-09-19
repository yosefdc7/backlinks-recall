import * as React from "react";
import InfluxFile from './InfluxFile';
import { ExtendedInlinkingFile } from './apiAdapter';
import { ObsidianInfluxSettings } from "./main";
import { TFile } from "obsidian";
import { StyleSheetType } from "./createStyleSheet";


interface InfluxReactComponentProps { influxFile: InfluxFile, preview: boolean, sheet: StyleSheetType }

export default function InfluxReactComponent(props: InfluxReactComponentProps): React.ReactElement {

	const {
		influxFile,
		preview = false,
		sheet,
	} = props

	const [components, setComponents] = React.useState(influxFile.components)
	const [stylesheet, setStyleSheet] = React.useState(sheet)
	const [collapsed, setCollapsed]: [string[], React.Dispatch<React.SetStateAction<string[]>>] = React.useState(influxFile.collapsed ? components.map(component => component.inlinkingFile.file.basename) : [])
	const [toggleAllToOpen, setToggleAllToOpen] = React.useState(influxFile.collapsed)

	const doToggle = (basename: string) => {
		if (collapsed.includes(basename)) {
			setCollapsed(collapsed.filter(name => name !== basename))
		}
		else {
			setCollapsed([...collapsed, basename])
		}
	}

	const toggleAll = () => {
		const all = components.map(component => component.inlinkingFile.file.basename)
		if (toggleAllToOpen) {
			setCollapsed([])
			setToggleAllToOpen(false)
		}
		else {
			setCollapsed(all)
			setToggleAllToOpen(true)
		}
	}

	React.useEffect(() => {

		const respondToUpdateTrigger: (op: string, stylesheet: StyleSheetType, file?: TFile) => void = async (op, stylesheet, file) => {

			if (op === 'modify' && !influxFile.shouldUpdate(file)) {
				return
			}

			setStyleSheet(stylesheet)
			await influxFile.makeInfluxList()
			setComponents(await influxFile.renderAllMarkdownBlocks())

		}

		influxFile.influx.registerInfluxComponent(influxFile.uuid, respondToUpdateTrigger)

		return () => {
			influxFile.influx.deregisterInfluxComponent(influxFile.uuid)
		}
	}, [])

	const classes = stylesheet.classes

	// const length = influxFile?.inlinkingFiles.length || 0
	const shownLength = influxFile?.components.length || 0

	const settings: Partial<ObsidianInfluxSettings> = influxFile.api.getSettings()

	const centered = settings.variant !== 'ROWS'

	if (!influxFile.show || shownLength === 0) {
		return null
	}
	
	return <React.Fragment>

		<div className={`embedded-backlinks ${classes.influxComponent}`} 
		style={{
			animation: 'fadeIn .6s'
		}}
		> 

			<div className="nav-header">

				<div className="nav-buttons-container">
					{/* <div className="clickable-icon nav-action-button" aria-label="Collapse results">
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="svg-icon lucide-list">
							<line x1="8" y1="6" x2="21" y2="6">
							</line>
							<line x1="8" y1="12" x2="21" y2="12">
							</line>
							<line x1="8" y1="18" x2="21" y2="18">
							</line>
							<line x1="3" y1="6" x2="3.01" y2="6">
							</line>
							<line x1="3" y1="12" x2="3.01" y2="12">
							</line>
							<line x1="3" y1="18" x2="3.01" y2="18">
							</line>
						</svg>
					</div> */}
					<div className="clickable-icon nav-action-button"
						aria-label={toggleAllToOpen ? 'Expand all' : 'Collapse all'}
						onClick={() => toggleAll()}
					>
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="svg-icon lucide-move-vertical">
							<polyline points="8 18 12 22 16 18">
							</polyline>
							<polyline points="8 6 12 2 16 6">
							</polyline>
							<line x1="12" y1="2" x2="12" y2="22">
							</line>
						</svg>
					</div>
				</div>

			</div>


			<div className="search-input-container" style={{ display: "none" }}>
				<input type="search" spellCheck="false" placeholder="Type to start search...">

				</input>
				<div className="search-input-clear-button" aria-label="Clear search" style={{ display: "none" }}>
				</div>
			</div>


			<div className="backlink-pane">

				<div
					onClick={() => toggleAll()}
					className={`tree-item-self is-clickable 
					${'' //	isOpen ? '' : 'is-collapsed'
						}`}
				>
					<div className="tree-item-inner" >
						Linked mentions
					</div>

					<div className="tree-item-flair-outer">
						<span className="tree-item-flair">{components.length}</span>
					</div>
				</div>

				<div className="search-result-container">

					<div className="search-results-children" >

						{components.map((extended: ExtendedInlinkingFile) => {

							const inlinkedCollapsed = collapsed.includes(extended.inlinkingFile.file.basename)

							return (

								<div key={extended.inlinkingFile.file.basename}
									className={`tree-item search-result ${inlinkedCollapsed ? 'is-collapsed' : ''}`}
									style={{ marginBottom: '1rem', width: '100%' }}
								>
									<div className="tree-item-self search-result-file-title"
										style={{
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'space-between',
											width: '100%',
											minHeight: '40px',
											padding: '6px 8px',
											borderRadius: '6px',
											cursor: 'pointer',
										}}
										onClick={() => doToggle(extended.inlinkingFile.file.basename)}
									>
										<div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
											<span style={{ fontSize: '1.05em', flexShrink: 0 }} aria-hidden="true">📄</span>
											<a
												data-href={extended.inlinkingFile.file.path}
												href={extended.inlinkingFile.file.path}
												className="internal-link"
												style={{
													fontWeight: 600,
													fontSize: '1em',
													overflow: 'hidden',
													textOverflow: 'ellipsis',
													whiteSpace: 'nowrap',
												}}
												onClick={async (e) => {
													e.preventDefault();
													e.stopPropagation();
													const isNewTab = e.metaKey || e.ctrlKey;
													const leaf = influxFile.influx.app.workspace.getLeaf(isNewTab);
													await leaf.openFile(extended.inlinkingFile.file);
												}}
											>
												{extended.inlinkingFile.file.basename}
											</a>
										</div>

										<div 
											className="tree-item-icon collapse-icon"
											style={{
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'center',
												width: '32px',
												height: '32px',
												flexShrink: 0,
											}}
										>
											<svg 
												xmlns="http://www.w3.org/2000/svg" 
												width="20" 
												height="20" 
												viewBox="0 0 24 24" 
												fill="none" 
												stroke="currentColor" 
												strokeWidth="2" 
												strokeLinecap="round" 
												strokeLinejoin="round" 
												style={{
													transform: inlinkedCollapsed ? 'rotate(0deg)' : 'rotate(180deg)',
													transition: 'transform 0.2s ease',
												}}
											>
												<path d="M6 9l6 6 6-6"></path>
											</svg>
										</div>
									</div>

									<div className="search-result-file-matches"
										style={inlinkedCollapsed ? { display: 'none' } : { width: '100%', marginTop: '4px' }}
									>
										<div className={classes.inlinkedEntries} >
											<div
												dangerouslySetInnerHTML={{ __html: extended.inner.innerHTML }}
												className={classes.inlinkedEntry}
											/>
										</div>
									</div>

								</div>

							)
						})}


					</div>

				</div>


			</div>

		</div>


		<style
			dangerouslySetInnerHTML={{ __html: stylesheet.toString() }}
		/>

	</React.Fragment>
}