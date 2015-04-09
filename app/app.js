
(function(win){

	var evid = {
		config: null,
		links: null,
		routings: null,
	};

	/**
	 * Loads an selected api. The first parameter is the selected "a" element
	 * which contains the data attributes path and version. The second parameter
	 * contains the request method which should be selected by default
	 *
	 * @param Element el
	 * @param string selectedTab
	 */
	evid.loadApi = function(el, selectedTab){
		var path = $(el).data('path');
		var version = $(el).data('version');

		// add selected class
		$('.evid-navigation ul li a').each(function(){
			$(this).removeClass('evid-navigation-selected');
		});

		$(el).addClass('evid-navigation-selected');

		// load api documentation
		var html = '<div id="evid-resource-toolbar"></div>';
		html+= '<h3 id="evid-resource-title"></h3>';
		html+= '<div id="evid-resource-description"></div>';
		html+= '<div id="evid-resource-nav"></div>';
		html+= '<div id="evid-resource-doc" class="tab-content"><div id="evid-loader"><img /></div></div>';
		$('#evid-content').html(html);

		var successCallback = function(resp){
			if (resp && typeof resp === 'object' && resp.path) {
				$('#evid-resource-title').html(resp.path + ' (v' + resp.resource.version + ')');
				$('#evid-resource-description').html(resp.description);

				// toolbar
				var html = '';
				if (resp.see_others) {
					for (var key in resp.see_others) {
						html+= '<button class="btn btn-default" onclick="evid.goToOther(\'' + resp.see_others[key] + '\')">' + key + '</button>';
					}
				}
				$('#evid-resource-toolbar').html(html);

				// content
				html = '';
				var nav  = '<ul class="nav nav-tabs">';

				for (var i = 0; i < resp.method.length; i++) {

					var method = resp.method[i].toUpperCase();

					nav += '<li role="presentation"><a href="#' + method + '">' + resp.method[i] + '</a></li>'
					html+= '<div role="tabpanel" class="tab-pane" id="' + method + '">';

					for (var key in resp.resource.data) {
						var data        = resp.resource.data[key];
						var description = '';
						var content     = '';

						$(data).find('.psx-resource-method').each(function(){
							if ($(this).data('method') == method) {
								description = $(this).find('.psx-resource-method-description').html();
								$(this).find('.psx-resource-data').each(function(){
									content+= '<div class="evid-resource-data">' + $(this).html() + '</div>';
								});
							}
						});

						if (content) {
							html+= '<div class="evid-resource-method">';
							if (description) {
								html+= '<div class="evid-resource-method-description">' + description + '</div>';
							}
							html+= '<h4>' + key + '</h4>';
							html+= content;
							html+= '</div>';
						}
					}

					html+= '</div>';
				}

				nav+= '</ul>';

				// add listener to tab navigation
				$('#evid-resource-nav').html(nav);
				$('#evid-resource-nav a').click(function(e){
					e.preventDefault();
					$(this).tab('show');
					location.hash = resp.path + ':' + $(this).attr('href').substr(1);
				});

				// highlite source code
				$('#evid-resource-doc').html(html);
				$('#evid-resource-doc').find('pre code').each(function(i, block) {
					hljs.highlightBlock(block);
				});

				// select tab
				if (selectedTab == 'GET' || selectedTab == 'POST' || selectedTab == 'PUT' || selectedTab == 'DELETE') {
					$('#evid-resource-nav a[href="#' + selectedTab + '"]').trigger('click');
				} else {
					$('#evid-resource-nav a:first').trigger('click');
				}

			} else {
				location.hash = '/' + path;
				$('#evid-resource-doc').html('<div class="alert alert-info" role="alert">No API documentation available</div>');
			}
		};

		var errorCallback = function(resp){
			location.hash = '/' + path;
			var data = resp.responseJSON;
			if (data.hasOwnProperty('success') && data.success === false) {
				$('#resource-doc').html('<div class="alert alert-danger" role="alert">' + data.message + '</div><pre>' + data.trace + '</pre>');
			} else {
				$('#resource-doc').html('<div class="alert alert-danger" role="alert">An unknown error occured</div><pre>' + resp.responseText + '</pre>');
			}
		};

		if (path.charAt(0) == '/') {
			path = path.substr(1);
		}

		var url = evid.getLink('detail');

		if (url != null) {
			url = url.replace(/{version}/g, version);
			url = url.replace(/{path}/g, path);

			$.ajax(url, {
				success: successCallback,
				error: errorCallback
			});

			return true;
		}

		return false;
	}

	/**
	 * Loads an arbitrary external path into evid which can be used to extend
	 * and customize the documentation
	 *
	 * @param string path
	 */
	evid.loadPage = function(path){
		$('#evid-content').html('<div id="evid-loader"><img /></div>');

		$.ajax({
			url: path,
			dataType: 'html',
			success: function(resp){
				$('#evid-content').html(resp);
			},
			error: function(resp){
				$('#evid-content').html(resp.responseText);
			}
		});
	}

	/**
	 * Returns an link with a specific relation type 
	 *
	 * @param string rel
	 * @return string
	 */
	evid.getLink = function(rel){
		if (evid.links) {
			for (var i = 0; i < evid.links.length; i++) {
				if (evid.links[i].rel == rel) {
					return evid.links[i].href;
				}
			}
		}
		return null;
	}

	/**
	 * Returns an routing entry for a specific path
	 *
	 * @param string path
	 * @return object
	 */
	evid.getRouting = function(path){
		if (routings) {
			for (var i = 0; i < routings.length; i++) {
				if (routings[i].path == path) {
					return routings[i];
				}
			}
		}
		return null;
	}

	/**
	 * Opens a new tab if the user clicks on see other link
	 *
	 * @param string path
	 */
	evid.goToOther = function(path){
		window.open(path, '_blank');
	}

	/**
	 * We check whether the evid_config object exists and then we load all 
	 * informations from there
	 */
	evid.initialize = function(){

		if (typeof win.evid_config !== 'object') {
			$('#evid-content').html('<br><div class="alert alert-danger" role="alert">It looks like the configuration is not available</div>');
			return;
		}

		if (typeof win.evid_config.url !== 'string') {
			$('#evid-content').html('<br><div class="alert alert-danger" role="alert">It looks like the PSX documentation url is not available</div>');
			return;
		}

		if (!$.isArray(win.evid_config.exclude)) {
			win.evid_config.exclude = [];
		}

		evid.config = win.evid_config;

		$.ajax({
			url: evid.config.url,
			success: function(resp){
				if ($.isArray(resp.links)) {
					evid.links = resp.links;
				}

				if ($.isArray(resp.routings)) {
					for (var i = 0; i < resp.routings.length; i++) {
						// check exclude
						var exclude = false;
						for (var j = 0; j < evid.config.exclude.length; j++) {
							if (resp.routings[i].path.match(evid.config.exclude[j])) {
								exclude = true;
								break;
							}
						}

						if (!exclude) {
							$('.evid-navigation ul').append('<li><a href="#' + resp.routings[i].path + '" data-path="' + resp.routings[i].path + '" data-version="' + resp.routings[i].version + '" onclick="evid.loadApi(this);">' + resp.routings[i].path + '</a></li>');
						}
					}

					evid.routings = resp.routings;
				}

				if (evid.links && evid.routings) {
					evid.loadFirstApi();
				} else {
					$('#evid-content').html('<br><div class="alert alert-danger" role="alert">Looks like the documentation API returns a wrong format</div>');
				}
			},
			error: function(resp){
				$('#evid-content').html('<br><div class="alert alert-danger" role="alert">Looks like the documentation API returns an error</div>');
			}
		});
	}

	/**
	 * Loads the first API after initialization or the API which was provided in
	 * the hash tag
	 */
	evid.loadFirstApi = function(){
		if (location.hash) {
			var path = location.hash.substr(1);
			var selectedTab = false;
			if (path.indexOf(':') !== -1) {
				selectedTab = path.substr(path.lastIndexOf(':') + 1);
				path = path.substr(0, path.lastIndexOf(':'));
			}

			var el = false;
			$('.evid-navigation ul li a').each(function(){
				if (el === false && $(this).data('path') == path) {
					el = this;
				}
			});

			if (el) {
				evid.loadApi(el, selectedTab);
			} else {
				$('.evid-navigation ul li a:first').trigger('click');
			}
		} else {
			$('.evid-navigation ul li a:first').trigger('click');
		}
	}

	win.evid = evid;

	$(document).ready(function(){
		evid.initialize();
	});

})(window);

