import * as ProgressPromise from "p-progress";

const pPromise = new ProgressPromise((resolve, reject, progress) => {
	progress(0.1);
	progress(0.21);
	progress(0.36);
	progress(0.45);
	progress(0.52);
	progress(0.69);
	progress(0.78);
	progress(0.84);
	progress(0.93);
	progress(1);
	resolve();
});

(async () => {
	pPromise.onProgress(progress => console.log(progress * 100));

	await pPromise;
})();
