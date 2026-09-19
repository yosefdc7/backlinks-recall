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

	const allBasenames = components.map(component => component.inlinkingFile.file.basename)
	const isAllCollapsed = allBasenames.length > 0 && allBasenames.every(name => collapsed.includes(name))

	const doToggle = (basename: string) => {
		if (collapsed.includes(basename)) {
			setCollapsed(collapsed.filter(name => name !== basename))
		}
		else {
			setCollapsed([...collapsed, basename])
		}
	}

	const toggleAll = () => {
		if (isAllCollapsed) {
			setCollapsed([])
		}
		else {
			setCollapsed(allBasenames)
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

			<div className="search-input-container" style={{ display: "none" }}>
				<input type="search" spellCheck="false" placeholder="Type to start search...">

				</input>
				<div className="search-input-clear-button" aria-label="Clear search" style={{ display: "none" }}>
				</div>
			</div>


			<div className="backlink-pane" style={{ width: '100%' }}>

				<div
					className={`tree-item-self is-clickable ${isAllCollapsed ? 'is-collapsed' : ''}`}
					style={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						width: '100%',
						minHeight: '28px',
						padding: '2px 6px',
						marginBottom: '4px',
						cursor: 'pointer',
						userSelect: 'none',
					}}
					onClick={() => toggleAll()}
				>
					<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
						<div className="tree-item-inner" style={{ fontWeight: 600 }}>
							Linked mentions
						</div>

						<div className="tree-item-flair-outer">
							<span className="tree-item-flair">{components.length}</span>
						</div>
					</div>

					<div
						className="clickable-icon nav-action-button"
						aria-label={isAllCollapsed ? 'Expand all' : 'Collapse all'}
						style={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							width: '24px',
							height: '24px',
							padding: 0,
							margin: 0,
						}}
						onClick={(e) => {
							e.stopPropagation();
							toggleAll();
						}}
					>
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="svg-icon lucide-chevrons-up-down">
							<path d="m7 15 5 5 5-5">
							</path>
							<path d="m7 9 5-5 5 5">
							</path>
						</svg>
					</div>
				</div>

				<div className="search-result-container">

					<div className="search-results-children" >

						{components.map((extended: ExtendedInlinkingFile) => {

							const inlinkedCollapsed = collapsed.includes(extended.inlinkingFile.file.basename)

							return (

								<div key={extended.inlinkingFile.file.basename}
									className={`tree-item search-result ${inlinkedCollapsed ? 'is-collapsed' : ''}`}
									style={{ marginBottom: '4px', width: '100%' }}
								>
									<div className="tree-item-self search-result-file-title"
										style={{
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'space-between',
											width: '100%',
											minHeight: '28px',
											padding: '2px 6px',
											borderRadius: '4px',
											cursor: 'pointer',
										}}
										onClick={() => doToggle(extended.inlinkingFile.file.basename)}
									>
										<div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
											<span style={{ fontSize: '0.95em', flexShrink: 0 }} aria-hidden="true">📄</span>
											<a
												data-href={extended.inlinkingFile.file.path}
												href={extended.inlinkingFile.file.path}
												className="internal-link"
												style={{
													fontWeight: 600,
													fontSize: '0.95em',
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
											className="influx-collapse-btn"
											aria-label={inlinkedCollapsed ? "Expand" : "Collapse"}
											style={{
												position: 'static',
												margin: '0 0 0 auto',
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'center',
												width: '24px',
												height: '24px',
												minWidth: '24px',
												flexShrink: 0,
												cursor: 'pointer',
												borderRadius: '4px',
											}}
											onClick={(e) => {
												e.stopPropagation();
												doToggle(extended.inlinkingFile.file.basename);
											}}
										>
											<svg 
												xmlns="http://www.w3.org/2000/svg" 
												width="14" 
												height="14" 
												viewBox="0 0 24 24" 
												fill="none" 
												stroke="currentColor" 
												strokeWidth="2" 
												strokeLinecap="round" 
												strokeLinejoin="round" 
												style={{
													transform: inlinkedCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
													transition: 'transform 0.15s ease',
												}}
											>
												<path d="M6 9l6 6 6-6"></path>
											</svg>
										</div>
									</div>

									<div className="search-result-file-matches"
										style={inlinkedCollapsed ? { display: 'none' } : { width: '100%', marginTop: '2px' }}
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