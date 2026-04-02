// 将“展示用文本”集中起来，方便你后续做多语言/自定义文案。
// 目前先按你现有积木的中文文本做默认值。
export const blockTexts = {
	event_when_started: {
		title: "当程序开始",
		tooltip: "程序入口",
		generatorComment: "// 当程序开始\n",
	},
	motor_run: {
		title: "电机",
		speedPrefix: "以转速",
		speedSuffix: "% 运行",
	},
	motor_stop: {
		title: "电机",
		stopText: "停止",
	},
	light_matrix_show: {
		title: "矩阵灯显示",
	},
	sound_play_tone: {
		title: "播放音调",
		durationPrefix: "持续",
		durationSuffix: "秒",
	},
	sensor_distance: {
		title: "距离传感器（cm）",
	},
	sensor_button_pressed: {
		buttonLabel: "按钮",
		pressedText: "已按下",
	},
} as const;

