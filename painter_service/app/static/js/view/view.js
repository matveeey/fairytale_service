export class SceneView {
	constructor(model) {
		this.model = model;
		this.scene = this.model.renderer.domElement;
		this.scene.width = window.innerWidth;
		this.scene.height = window.innerHeight;
		document.body.appendChild(this.scene);

		this.colorPicker = document.getElementById('colorPicker');
		this.currentColorPreview = document.getElementById('currentColor');

		this.initEventListeners();
	}

	initEventListeners() {
		this.colorPicker.addEventListener('input', (e) => {
			this.model.setColor(e.target.value);
			this.currentColorPreview.style.backgroundColor = this.model.currentColor;
		});

		this.scene.addEventListener('mousedown', (e) => {
			this.model.handleMouseDown(e)
		});
		this.scene.addEventListener('mouseup', () => {
			this.model.handleMouseUp()
		});
		this.scene.addEventListener('mousemove', (e) => {
			this.model.handleMouseMove(e)
		});
		this.scene.addEventListener('wheel', (e) => {
			this.model.handleWheel(e)
		});
		this.scene.addEventListener('touchstart', (e) => {
			this.model.handleTouchStart(e)
		});
		this.scene.addEventListener('touchmove', (e) => {
			this.model.handleTouchMove(e)
		});
		this.scene.addEventListener('touchend', () => {
			this.model.handleTouchEnd()
		});
		window.addEventListener('resize', () => {
			this.model.handleResize()
		});

		document.querySelectorAll('.tool-btn').forEach(btn => {
			btn.addEventListener('click', (e) => {
				document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
				btn.classList.add('active');
				this.model.setTool(btn.dataset.tool);
			});
		});
	}

	render() {
		this.currentColorPreview.style.backgroundColor = this.model.currentColor;
	}
}