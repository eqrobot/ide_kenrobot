Ext.define('platform.view.Viewport', {
	extend: 'Ext.container.Viewport',
	layout: 'border',
	items: [{
		region: 'north',
		xtype: 'topPanel',
	}, {
		region: 'west',
		xtype: 'leftBar',
	}, {
		region: 'east',
		xtype: 'rightBar',
	}, {
		region: 'south',
		xtype: 'statusBar',
	}, {
		region: 'center',
		xtype: 'centerPanel',
	}],
});