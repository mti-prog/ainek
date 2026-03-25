/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/gemini/route";
exports.ids = ["app/api/gemini/route"];
exports.modules = {

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fgemini%2Froute&page=%2Fapi%2Fgemini%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fgemini%2Froute.ts&appDir=C%3A%5CUsers%5Ccpu%5CDesktop%5Cainek_mvp_claude%5Cainek%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Ccpu%5CDesktop%5Cainek_mvp_claude%5Cainek&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D&isGlobalNotFoundEnabled=!":
/*!*************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fgemini%2Froute&page=%2Fapi%2Fgemini%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fgemini%2Froute.ts&appDir=C%3A%5CUsers%5Ccpu%5CDesktop%5Cainek_mvp_claude%5Cainek%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Ccpu%5CDesktop%5Cainek_mvp_claude%5Cainek&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D&isGlobalNotFoundEnabled=! ***!
  \*************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   handler: () => (/* binding */ handler),\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   workAsyncStorage: () => (/* binding */ workAsyncStorage),\n/* harmony export */   workUnitAsyncStorage: () => (/* binding */ workUnitAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/route-kind */ \"(rsc)/./node_modules/next/dist/server/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var next_dist_server_request_meta__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! next/dist/server/request-meta */ \"(rsc)/./node_modules/next/dist/server/request-meta.js\");\n/* harmony import */ var next_dist_server_request_meta__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_request_meta__WEBPACK_IMPORTED_MODULE_3__);\n/* harmony import */ var next_dist_server_lib_trace_tracer__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! next/dist/server/lib/trace/tracer */ \"(rsc)/./node_modules/next/dist/server/lib/trace/tracer.js\");\n/* harmony import */ var next_dist_server_lib_trace_tracer__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_trace_tracer__WEBPACK_IMPORTED_MODULE_4__);\n/* harmony import */ var next_dist_shared_lib_router_utils_app_paths__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! next/dist/shared/lib/router/utils/app-paths */ \"next/dist/shared/lib/router/utils/app-paths\");\n/* harmony import */ var next_dist_shared_lib_router_utils_app_paths__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(next_dist_shared_lib_router_utils_app_paths__WEBPACK_IMPORTED_MODULE_5__);\n/* harmony import */ var next_dist_server_base_http_node__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! next/dist/server/base-http/node */ \"(rsc)/./node_modules/next/dist/server/base-http/node.js\");\n/* harmony import */ var next_dist_server_base_http_node__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_base_http_node__WEBPACK_IMPORTED_MODULE_6__);\n/* harmony import */ var next_dist_server_web_spec_extension_adapters_next_request__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! next/dist/server/web/spec-extension/adapters/next-request */ \"(rsc)/./node_modules/next/dist/server/web/spec-extension/adapters/next-request.js\");\n/* harmony import */ var next_dist_server_web_spec_extension_adapters_next_request__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_web_spec_extension_adapters_next_request__WEBPACK_IMPORTED_MODULE_7__);\n/* harmony import */ var next_dist_server_lib_trace_constants__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! next/dist/server/lib/trace/constants */ \"(rsc)/./node_modules/next/dist/server/lib/trace/constants.js\");\n/* harmony import */ var next_dist_server_lib_trace_constants__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_trace_constants__WEBPACK_IMPORTED_MODULE_8__);\n/* harmony import */ var next_dist_server_instrumentation_utils__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! next/dist/server/instrumentation/utils */ \"(rsc)/./node_modules/next/dist/server/instrumentation/utils.js\");\n/* harmony import */ var next_dist_server_send_response__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! next/dist/server/send-response */ \"(rsc)/./node_modules/next/dist/server/send-response.js\");\n/* harmony import */ var next_dist_server_web_utils__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! next/dist/server/web/utils */ \"(rsc)/./node_modules/next/dist/server/web/utils.js\");\n/* harmony import */ var next_dist_server_web_utils__WEBPACK_IMPORTED_MODULE_11___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_web_utils__WEBPACK_IMPORTED_MODULE_11__);\n/* harmony import */ var next_dist_server_lib_cache_control__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! next/dist/server/lib/cache-control */ \"(rsc)/./node_modules/next/dist/server/lib/cache-control.js\");\n/* harmony import */ var next_dist_lib_constants__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! next/dist/lib/constants */ \"(rsc)/./node_modules/next/dist/lib/constants.js\");\n/* harmony import */ var next_dist_lib_constants__WEBPACK_IMPORTED_MODULE_13___default = /*#__PURE__*/__webpack_require__.n(next_dist_lib_constants__WEBPACK_IMPORTED_MODULE_13__);\n/* harmony import */ var next_dist_shared_lib_no_fallback_error_external__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! next/dist/shared/lib/no-fallback-error.external */ \"next/dist/shared/lib/no-fallback-error.external\");\n/* harmony import */ var next_dist_shared_lib_no_fallback_error_external__WEBPACK_IMPORTED_MODULE_14___default = /*#__PURE__*/__webpack_require__.n(next_dist_shared_lib_no_fallback_error_external__WEBPACK_IMPORTED_MODULE_14__);\n/* harmony import */ var next_dist_server_response_cache__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! next/dist/server/response-cache */ \"(rsc)/./node_modules/next/dist/server/response-cache/index.js\");\n/* harmony import */ var next_dist_server_response_cache__WEBPACK_IMPORTED_MODULE_15___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_response_cache__WEBPACK_IMPORTED_MODULE_15__);\n/* harmony import */ var C_Users_cpu_Desktop_ainek_mvp_claude_ainek_src_app_api_gemini_route_ts__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ./src/app/api/gemini/route.ts */ \"(rsc)/./src/app/api/gemini/route.ts\");\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/gemini/route\",\n        pathname: \"/api/gemini\",\n        filename: \"route\",\n        bundlePath: \"app/api/gemini/route\"\n    },\n    distDir: \".next\" || 0,\n    relativeProjectDir:  false || '',\n    resolvedPagePath: \"C:\\\\Users\\\\cpu\\\\Desktop\\\\ainek_mvp_claude\\\\ainek\\\\src\\\\app\\\\api\\\\gemini\\\\route.ts\",\n    nextConfigOutput,\n    userland: C_Users_cpu_Desktop_ainek_mvp_claude_ainek_src_app_api_gemini_route_ts__WEBPACK_IMPORTED_MODULE_16__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { workAsyncStorage, workUnitAsyncStorage, serverHooks } = routeModule;\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        workAsyncStorage,\n        workUnitAsyncStorage\n    });\n}\n\nasync function handler(req, res, ctx) {\n    var _nextConfig_experimental;\n    let srcPage = \"/api/gemini/route\";\n    // turbopack doesn't normalize `/index` in the page name\n    // so we need to to process dynamic routes properly\n    // TODO: fix turbopack providing differing value from webpack\n    if (false) {} else if (srcPage === '/index') {\n        // we always normalize /index specifically\n        srcPage = '/';\n    }\n    const multiZoneDraftMode = false;\n    const prepareResult = await routeModule.prepare(req, res, {\n        srcPage,\n        multiZoneDraftMode\n    });\n    if (!prepareResult) {\n        res.statusCode = 400;\n        res.end('Bad Request');\n        ctx.waitUntil == null ? void 0 : ctx.waitUntil.call(ctx, Promise.resolve());\n        return null;\n    }\n    const { buildId, params, nextConfig, isDraftMode, prerenderManifest, routerServerContext, isOnDemandRevalidate, revalidateOnlyGenerated, resolvedPathname } = prepareResult;\n    const normalizedSrcPage = (0,next_dist_shared_lib_router_utils_app_paths__WEBPACK_IMPORTED_MODULE_5__.normalizeAppPath)(srcPage);\n    let isIsr = Boolean(prerenderManifest.dynamicRoutes[normalizedSrcPage] || prerenderManifest.routes[resolvedPathname]);\n    if (isIsr && !isDraftMode) {\n        const isPrerendered = Boolean(prerenderManifest.routes[resolvedPathname]);\n        const prerenderInfo = prerenderManifest.dynamicRoutes[normalizedSrcPage];\n        if (prerenderInfo) {\n            if (prerenderInfo.fallback === false && !isPrerendered) {\n                throw new next_dist_shared_lib_no_fallback_error_external__WEBPACK_IMPORTED_MODULE_14__.NoFallbackError();\n            }\n        }\n    }\n    let cacheKey = null;\n    if (isIsr && !routeModule.isDev && !isDraftMode) {\n        cacheKey = resolvedPathname;\n        // ensure /index and / is normalized to one key\n        cacheKey = cacheKey === '/index' ? '/' : cacheKey;\n    }\n    const supportsDynamicResponse = // If we're in development, we always support dynamic HTML\n    routeModule.isDev === true || // If this is not SSG or does not have static paths, then it supports\n    // dynamic HTML.\n    !isIsr;\n    // This is a revalidation request if the request is for a static\n    // page and it is not being resumed from a postponed render and\n    // it is not a dynamic RSC request then it is a revalidation\n    // request.\n    const isRevalidate = isIsr && !supportsDynamicResponse;\n    const method = req.method || 'GET';\n    const tracer = (0,next_dist_server_lib_trace_tracer__WEBPACK_IMPORTED_MODULE_4__.getTracer)();\n    const activeSpan = tracer.getActiveScopeSpan();\n    const context = {\n        params,\n        prerenderManifest,\n        renderOpts: {\n            experimental: {\n                cacheComponents: Boolean(nextConfig.experimental.cacheComponents),\n                authInterrupts: Boolean(nextConfig.experimental.authInterrupts)\n            },\n            supportsDynamicResponse,\n            incrementalCache: (0,next_dist_server_request_meta__WEBPACK_IMPORTED_MODULE_3__.getRequestMeta)(req, 'incrementalCache'),\n            cacheLifeProfiles: (_nextConfig_experimental = nextConfig.experimental) == null ? void 0 : _nextConfig_experimental.cacheLife,\n            isRevalidate,\n            waitUntil: ctx.waitUntil,\n            onClose: (cb)=>{\n                res.on('close', cb);\n            },\n            onAfterTaskError: undefined,\n            onInstrumentationRequestError: (error, _request, errorContext)=>routeModule.onRequestError(req, error, errorContext, routerServerContext)\n        },\n        sharedContext: {\n            buildId\n        }\n    };\n    const nodeNextReq = new next_dist_server_base_http_node__WEBPACK_IMPORTED_MODULE_6__.NodeNextRequest(req);\n    const nodeNextRes = new next_dist_server_base_http_node__WEBPACK_IMPORTED_MODULE_6__.NodeNextResponse(res);\n    const nextReq = next_dist_server_web_spec_extension_adapters_next_request__WEBPACK_IMPORTED_MODULE_7__.NextRequestAdapter.fromNodeNextRequest(nodeNextReq, (0,next_dist_server_web_spec_extension_adapters_next_request__WEBPACK_IMPORTED_MODULE_7__.signalFromNodeResponse)(res));\n    try {\n        const invokeRouteModule = async (span)=>{\n            return routeModule.handle(nextReq, context).finally(()=>{\n                if (!span) return;\n                span.setAttributes({\n                    'http.status_code': res.statusCode,\n                    'next.rsc': false\n                });\n                const rootSpanAttributes = tracer.getRootSpanAttributes();\n                // We were unable to get attributes, probably OTEL is not enabled\n                if (!rootSpanAttributes) {\n                    return;\n                }\n                if (rootSpanAttributes.get('next.span_type') !== next_dist_server_lib_trace_constants__WEBPACK_IMPORTED_MODULE_8__.BaseServerSpan.handleRequest) {\n                    console.warn(`Unexpected root span type '${rootSpanAttributes.get('next.span_type')}'. Please report this Next.js issue https://github.com/vercel/next.js`);\n                    return;\n                }\n                const route = rootSpanAttributes.get('next.route');\n                if (route) {\n                    const name = `${method} ${route}`;\n                    span.setAttributes({\n                        'next.route': route,\n                        'http.route': route,\n                        'next.span_name': name\n                    });\n                    span.updateName(name);\n                } else {\n                    span.updateName(`${method} ${req.url}`);\n                }\n            });\n        };\n        const handleResponse = async (currentSpan)=>{\n            var _cacheEntry_value;\n            const responseGenerator = async ({ previousCacheEntry })=>{\n                try {\n                    if (!(0,next_dist_server_request_meta__WEBPACK_IMPORTED_MODULE_3__.getRequestMeta)(req, 'minimalMode') && isOnDemandRevalidate && revalidateOnlyGenerated && !previousCacheEntry) {\n                        res.statusCode = 404;\n                        // on-demand revalidate always sets this header\n                        res.setHeader('x-nextjs-cache', 'REVALIDATED');\n                        res.end('This page could not be found');\n                        return null;\n                    }\n                    const response = await invokeRouteModule(currentSpan);\n                    req.fetchMetrics = context.renderOpts.fetchMetrics;\n                    let pendingWaitUntil = context.renderOpts.pendingWaitUntil;\n                    // Attempt using provided waitUntil if available\n                    // if it's not we fallback to sendResponse's handling\n                    if (pendingWaitUntil) {\n                        if (ctx.waitUntil) {\n                            ctx.waitUntil(pendingWaitUntil);\n                            pendingWaitUntil = undefined;\n                        }\n                    }\n                    const cacheTags = context.renderOpts.collectedTags;\n                    // If the request is for a static response, we can cache it so long\n                    // as it's not edge.\n                    if (isIsr) {\n                        const blob = await response.blob();\n                        // Copy the headers from the response.\n                        const headers = (0,next_dist_server_web_utils__WEBPACK_IMPORTED_MODULE_11__.toNodeOutgoingHttpHeaders)(response.headers);\n                        if (cacheTags) {\n                            headers[next_dist_lib_constants__WEBPACK_IMPORTED_MODULE_13__.NEXT_CACHE_TAGS_HEADER] = cacheTags;\n                        }\n                        if (!headers['content-type'] && blob.type) {\n                            headers['content-type'] = blob.type;\n                        }\n                        const revalidate = typeof context.renderOpts.collectedRevalidate === 'undefined' || context.renderOpts.collectedRevalidate >= next_dist_lib_constants__WEBPACK_IMPORTED_MODULE_13__.INFINITE_CACHE ? false : context.renderOpts.collectedRevalidate;\n                        const expire = typeof context.renderOpts.collectedExpire === 'undefined' || context.renderOpts.collectedExpire >= next_dist_lib_constants__WEBPACK_IMPORTED_MODULE_13__.INFINITE_CACHE ? undefined : context.renderOpts.collectedExpire;\n                        // Create the cache entry for the response.\n                        const cacheEntry = {\n                            value: {\n                                kind: next_dist_server_response_cache__WEBPACK_IMPORTED_MODULE_15__.CachedRouteKind.APP_ROUTE,\n                                status: response.status,\n                                body: Buffer.from(await blob.arrayBuffer()),\n                                headers\n                            },\n                            cacheControl: {\n                                revalidate,\n                                expire\n                            }\n                        };\n                        return cacheEntry;\n                    } else {\n                        // send response without caching if not ISR\n                        await (0,next_dist_server_send_response__WEBPACK_IMPORTED_MODULE_10__.sendResponse)(nodeNextReq, nodeNextRes, response, context.renderOpts.pendingWaitUntil);\n                        return null;\n                    }\n                } catch (err) {\n                    // if this is a background revalidate we need to report\n                    // the request error here as it won't be bubbled\n                    if (previousCacheEntry == null ? void 0 : previousCacheEntry.isStale) {\n                        await routeModule.onRequestError(req, err, {\n                            routerKind: 'App Router',\n                            routePath: srcPage,\n                            routeType: 'route',\n                            revalidateReason: (0,next_dist_server_instrumentation_utils__WEBPACK_IMPORTED_MODULE_9__.getRevalidateReason)({\n                                isRevalidate,\n                                isOnDemandRevalidate\n                            })\n                        }, routerServerContext);\n                    }\n                    throw err;\n                }\n            };\n            const cacheEntry = await routeModule.handleResponse({\n                req,\n                nextConfig,\n                cacheKey,\n                routeKind: next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n                isFallback: false,\n                prerenderManifest,\n                isRoutePPREnabled: false,\n                isOnDemandRevalidate,\n                revalidateOnlyGenerated,\n                responseGenerator,\n                waitUntil: ctx.waitUntil\n            });\n            // we don't create a cacheEntry for ISR\n            if (!isIsr) {\n                return null;\n            }\n            if ((cacheEntry == null ? void 0 : (_cacheEntry_value = cacheEntry.value) == null ? void 0 : _cacheEntry_value.kind) !== next_dist_server_response_cache__WEBPACK_IMPORTED_MODULE_15__.CachedRouteKind.APP_ROUTE) {\n                var _cacheEntry_value1;\n                throw Object.defineProperty(new Error(`Invariant: app-route received invalid cache entry ${cacheEntry == null ? void 0 : (_cacheEntry_value1 = cacheEntry.value) == null ? void 0 : _cacheEntry_value1.kind}`), \"__NEXT_ERROR_CODE\", {\n                    value: \"E701\",\n                    enumerable: false,\n                    configurable: true\n                });\n            }\n            if (!(0,next_dist_server_request_meta__WEBPACK_IMPORTED_MODULE_3__.getRequestMeta)(req, 'minimalMode')) {\n                res.setHeader('x-nextjs-cache', isOnDemandRevalidate ? 'REVALIDATED' : cacheEntry.isMiss ? 'MISS' : cacheEntry.isStale ? 'STALE' : 'HIT');\n            }\n            // Draft mode should never be cached\n            if (isDraftMode) {\n                res.setHeader('Cache-Control', 'private, no-cache, no-store, max-age=0, must-revalidate');\n            }\n            const headers = (0,next_dist_server_web_utils__WEBPACK_IMPORTED_MODULE_11__.fromNodeOutgoingHttpHeaders)(cacheEntry.value.headers);\n            if (!((0,next_dist_server_request_meta__WEBPACK_IMPORTED_MODULE_3__.getRequestMeta)(req, 'minimalMode') && isIsr)) {\n                headers.delete(next_dist_lib_constants__WEBPACK_IMPORTED_MODULE_13__.NEXT_CACHE_TAGS_HEADER);\n            }\n            // If cache control is already set on the response we don't\n            // override it to allow users to customize it via next.config\n            if (cacheEntry.cacheControl && !res.getHeader('Cache-Control') && !headers.get('Cache-Control')) {\n                headers.set('Cache-Control', (0,next_dist_server_lib_cache_control__WEBPACK_IMPORTED_MODULE_12__.getCacheControlHeader)(cacheEntry.cacheControl));\n            }\n            await (0,next_dist_server_send_response__WEBPACK_IMPORTED_MODULE_10__.sendResponse)(nodeNextReq, nodeNextRes, new Response(cacheEntry.value.body, {\n                headers,\n                status: cacheEntry.value.status || 200\n            }));\n            return null;\n        };\n        // TODO: activeSpan code path is for when wrapped by\n        // next-server can be removed when this is no longer used\n        if (activeSpan) {\n            await handleResponse(activeSpan);\n        } else {\n            await tracer.withPropagatedContext(req.headers, ()=>tracer.trace(next_dist_server_lib_trace_constants__WEBPACK_IMPORTED_MODULE_8__.BaseServerSpan.handleRequest, {\n                    spanName: `${method} ${req.url}`,\n                    kind: next_dist_server_lib_trace_tracer__WEBPACK_IMPORTED_MODULE_4__.SpanKind.SERVER,\n                    attributes: {\n                        'http.method': method,\n                        'http.target': req.url\n                    }\n                }, handleResponse));\n        }\n    } catch (err) {\n        if (!(err instanceof next_dist_shared_lib_no_fallback_error_external__WEBPACK_IMPORTED_MODULE_14__.NoFallbackError)) {\n            await routeModule.onRequestError(req, err, {\n                routerKind: 'App Router',\n                routePath: normalizedSrcPage,\n                routeType: 'route',\n                revalidateReason: (0,next_dist_server_instrumentation_utils__WEBPACK_IMPORTED_MODULE_9__.getRevalidateReason)({\n                    isRevalidate,\n                    isOnDemandRevalidate\n                })\n            });\n        }\n        // rethrow so that we can handle serving error page\n        // If this is during static generation, throw the error again.\n        if (isIsr) throw err;\n        // Otherwise, send a 500 response.\n        await (0,next_dist_server_send_response__WEBPACK_IMPORTED_MODULE_10__.sendResponse)(nodeNextReq, nodeNextRes, new Response(null, {\n            status: 500\n        }));\n        return null;\n    }\n}\n\n//# sourceMappingURL=app-route.js.map\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIvaW5kZXguanM/bmFtZT1hcHAlMkZhcGklMkZnZW1pbmklMkZyb3V0ZSZwYWdlPSUyRmFwaSUyRmdlbWluaSUyRnJvdXRlJmFwcFBhdGhzPSZwYWdlUGF0aD1wcml2YXRlLW5leHQtYXBwLWRpciUyRmFwaSUyRmdlbWluaSUyRnJvdXRlLnRzJmFwcERpcj1DJTNBJTVDVXNlcnMlNUNjcHUlNUNEZXNrdG9wJTVDYWluZWtfbXZwX2NsYXVkZSU1Q2FpbmVrJTVDc3JjJTVDYXBwJnBhZ2VFeHRlbnNpb25zPXRzeCZwYWdlRXh0ZW5zaW9ucz10cyZwYWdlRXh0ZW5zaW9ucz1qc3gmcGFnZUV4dGVuc2lvbnM9anMmcm9vdERpcj1DJTNBJTVDVXNlcnMlNUNjcHUlNUNEZXNrdG9wJTVDYWluZWtfbXZwX2NsYXVkZSU1Q2FpbmVrJmlzRGV2PXRydWUmdHNjb25maWdQYXRoPXRzY29uZmlnLmpzb24mYmFzZVBhdGg9JmFzc2V0UHJlZml4PSZuZXh0Q29uZmlnT3V0cHV0PSZwcmVmZXJyZWRSZWdpb249Jm1pZGRsZXdhcmVDb25maWc9ZTMwJTNEJmlzR2xvYmFsTm90Rm91bmRFbmFibGVkPSEiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBK0Y7QUFDdkM7QUFDcUI7QUFDZDtBQUNTO0FBQ087QUFDSztBQUNtQztBQUNqRDtBQUNPO0FBQ2Y7QUFDc0M7QUFDekI7QUFDTTtBQUNDO0FBQ2hCO0FBQzRDO0FBQzlHO0FBQ0E7QUFDQTtBQUNBLHdCQUF3Qix5R0FBbUI7QUFDM0M7QUFDQSxjQUFjLGtFQUFTO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMLGFBQWEsT0FBb0MsSUFBSSxDQUFFO0FBQ3ZELHdCQUF3QixNQUF1QztBQUMvRDtBQUNBO0FBQ0EsWUFBWTtBQUNaLENBQUM7QUFDRDtB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O0FBQzlCO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWLDZFQUE2RSxnRkFBYztBQUMzRixpQ0FBaUMsUUFBUSxFQUFFLFFBQVE7QUFDbkQsMEJBQTBCLHVFQUFRO0FBQ2xDO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0EsTUFBTTtBQUNOLDZCQUE2Qiw2RkFBZTtBQUM1QztBQUNBO0FBQ0E7QUFDQTtBQUNBLGtDQUFrQywyRkFBbUI7QUFDckQ7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQixhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGNBQWMsNkVBQVk7QUFDMUI7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBOztBQUVBIiwic291cmNlcyI6WyIiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQXBwUm91dGVSb3V0ZU1vZHVsZSB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL3JvdXRlLW1vZHVsZXMvYXBwLXJvdXRlL21vZHVsZS5jb21waWxlZFwiO1xuaW1wb3J0IHsgUm91dGVLaW5kIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvcm91dGUta2luZFwiO1xuaW1wb3J0IHsgcGF0Y2hGZXRjaCBhcyBfcGF0Y2hGZXRjaCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2xpYi9wYXRjaC1mZXRjaFwiO1xuaW1wb3J0IHsgZ2V0UmVxdWVzdE1ldGEgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9yZXF1ZXN0LW1ldGFcIjtcbmltcG9ydCB7IGdldFRyYWNlciwgU3BhbktpbmQgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9saWIvdHJhY2UvdHJhY2VyXCI7XG5pbXBvcnQgeyBub3JtYWxpemVBcHBQYXRoIH0gZnJvbSBcIm5leHQvZGlzdC9zaGFyZWQvbGliL3JvdXRlci91dGlscy9hcHAtcGF0aHNcIjtcbmltcG9ydCB7IE5vZGVOZXh0UmVxdWVzdCwgTm9kZU5leHRSZXNwb25zZSB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2Jhc2UtaHR0cC9ub2RlXCI7XG5pbXBvcnQgeyBOZXh0UmVxdWVzdEFkYXB0ZXIsIHNpZ25hbEZyb21Ob2RlUmVzcG9uc2UgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci93ZWIvc3BlYy1leHRlbnNpb24vYWRhcHRlcnMvbmV4dC1yZXF1ZXN0XCI7XG5pbXBvcnQgeyBCYXNlU2VydmVyU3BhbiB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2xpYi90cmFjZS9jb25zdGFudHNcIjtcbmltcG9ydCB7IGdldFJldmFsaWRhdGVSZWFzb24gfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9pbnN0cnVtZW50YXRpb24vdXRpbHNcIjtcbmltcG9ydCB7IHNlbmRSZXNwb25zZSB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL3NlbmQtcmVzcG9uc2VcIjtcbmltcG9ydCB7IGZyb21Ob2RlT3V0Z29pbmdIdHRwSGVhZGVycywgdG9Ob2RlT3V0Z29pbmdIdHRwSGVhZGVycyB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL3dlYi91dGlsc1wiO1xuaW1wb3J0IHsgZ2V0Q2FjaGVDb250cm9sSGVhZGVyIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvbGliL2NhY2hlLWNvbnRyb2xcIjtcbmltcG9ydCB7IElORklOSVRFX0NBQ0hFLCBORVhUX0NBQ0hFX1RBR1NfSEVBREVSIH0gZnJvbSBcIm5leHQvZGlzdC9saWIvY29uc3RhbnRzXCI7XG5pbXBvcnQgeyBOb0ZhbGxiYWNrRXJyb3IgfSBmcm9tIFwibmV4dC9kaXN0L3NoYXJlZC9saWIvbm8tZmFsbGJhY2stZXJyb3IuZXh0ZXJuYWxcIjtcbmltcG9ydCB7IENhY2hlZFJvdXRlS2luZCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL3Jlc3BvbnNlLWNhY2hlXCI7XG5pbXBvcnQgKiBhcyB1c2VybGFuZCBmcm9tIFwiQzpcXFxcVXNlcnNcXFxcY3B1XFxcXERlc2t0b3BcXFxcYWluZWtfbXZwX2NsYXVkZVxcXFxhaW5la1xcXFxzcmNcXFxcYXBwXFxcXGFwaVxcXFxnZW1pbmlcXFxccm91dGUudHNcIjtcbi8vIFdlIGluamVjdCB0aGUgbmV4dENvbmZpZ091dHB1dCBoZXJlIHNvIHRoYXQgd2UgY2FuIHVzZSB0aGVtIGluIHRoZSByb3V0ZVxuLy8gbW9kdWxlLlxuY29uc3QgbmV4dENvbmZpZ091dHB1dCA9IFwiXCJcbmNvbnN0IHJvdXRlTW9kdWxlID0gbmV3IEFwcFJvdXRlUm91dGVNb2R1bGUoe1xuICAgIGRlZmluaXRpb246IHtcbiAgICAgICAga2luZDogUm91dGVLaW5kLkFQUF9ST1VURSxcbiAgICAgICAgcGFnZTogXCIvYXBpL2dlbWluaS9yb3V0ZVwiLFxuICAgICAgICBwYXRobmFtZTogXCIvYXBpL2dlbWluaVwiLFxuICAgICAgICBmaWxlbmFtZTogXCJyb3V0ZVwiLFxuICAgICAgICBidW5kbGVQYXRoOiBcImFwcC9hcGkvZ2VtaW5pL3JvdXRlXCJcbiAgICB9LFxuICAgIGRpc3REaXI6IHByb2Nlc3MuZW52Ll9fTkVYVF9SRUxBVElWRV9ESVNUX0RJUiB8fCAnJyxcbiAgICByZWxhdGl2ZVByb2plY3REaXI6IHByb2Nlc3MuZW52Ll9fTkVYVF9SRUxBVElWRV9QUk9KRUNUX0RJUiB8fCAnJyxcbiAgICByZXNvbHZlZFBhZ2VQYXRoOiBcIkM6XFxcXFVzZXJzXFxcXGNwdVxcXFxEZXNrdG9wXFxcXGFpbmVrX212cF9jbGF1ZGVcXFxcYWluZWtcXFxcc3JjXFxcXGFwcFxcXFxhcGlcXFxcZ2VtaW5pXFxcXHJvdXRlLnRzXCIsXG4gICAgbmV4dENvbmZpZ091dHB1dCxcbiAgICB1c2VybGFuZFxufSk7XG4vLyBQdWxsIG91dCB0aGUgZXhwb3J0cyB0aGF0IHdlIG5lZWQgdG8gZXhwb3NlIGZyb20gdGhlIG1vZHVsZS4gVGhpcyBzaG91bGRcbi8vIGJlIGVsaW1pbmF0ZWQgd2hlbiB3ZSd2ZSBtb3ZlZCB0aGUgb3RoZXIgcm91dGVzIHRvIHRoZSBuZXcgZm9ybWF0LiBUaGVzZVxuLy8gYXJlIHVzZWQgdG8gaG9vayBpbnRvIHRoZSByb3V0ZS5cbmNvbnN0IHsgd29ya0FzeW5jU3RvcmFnZSwgd29ya1VuaXRBc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzIH0gPSByb3V0ZU1vZHVsZTtcbmZ1bmN0aW9uIHBhdGNoRmV0Y2goKSB7XG4gICAgcmV0dXJuIF9wYXRjaEZldGNoKHtcbiAgICAgICAgd29ya0FzeW5jU3RvcmFnZSxcbiAgICAgICAgd29ya1VuaXRBc3luY1N0b3JhZ2VcbiAgICB9KTtcbn1cbmV4cG9ydCB7IHJvdXRlTW9kdWxlLCB3b3JrQXN5bmNTdG9yYWdlLCB3b3JrVW5pdEFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MsIHBhdGNoRmV0Y2gsICB9O1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGhhbmRsZXIocmVxLCByZXMsIGN0eCkge1xuICAgIHZhciBfbmV4dENvbmZpZ19leHBlcmltZW50YWw7XG4gICAgbGV0IHNyY1BhZ2UgPSBcIi9hcGkvZ2VtaW5pL3JvdXRlXCI7XG4gICAgLy8gdHVyYm9wYWNrIGRvZXNuJ3Qgbm9ybWFsaXplIGAvaW5kZXhgIGluIHRoZSBwYWdlIG5hbWVcbiAgICAvLyBzbyB3ZSBuZWVkIHRvIHRvIHByb2Nlc3MgZHluYW1pYyByb3V0ZXMgcHJvcGVybHlcbiAgICAvLyBUT0RPOiBmaXggdHVyYm9wYWNrIHByb3ZpZGluZyBkaWZmZXJpbmcgdmFsdWUgZnJvbSB3ZWJwYWNrXG4gICAgaWYgKHByb2Nlc3MuZW52LlRVUkJPUEFDSykge1xuICAgICAgICBzcmNQYWdlID0gc3JjUGFnZS5yZXBsYWNlKC9cXC9pbmRleCQvLCAnJykgfHwgJy8nO1xuICAgIH0gZWxzZSBpZiAoc3JjUGFnZSA9PT0gJy9pbmRleCcpIHtcbiAgICAgICAgLy8gd2UgYWx3YXlzIG5vcm1hbGl6ZSAvaW5kZXggc3BlY2lmaWNhbGx5XG4gICAgICAgIHNyY1BhZ2UgPSAnLyc7XG4gICAgfVxuICAgIGNvbnN0IG11bHRpWm9uZURyYWZ0TW9kZSA9IHByb2Nlc3MuZW52Ll9fTkVYVF9NVUxUSV9aT05FX0RSQUZUX01PREU7XG4gICAgY29uc3QgcHJlcGFyZVJlc3VsdCA9IGF3YWl0IHJvdXRlTW9kdWxlLnByZXBhcmUocmVxLCByZXMsIHtcbiAgICAgICAgc3JjUGFnZSxcbiAgICAgICAgbXVsdGlab25lRHJhZnRNb2RlXG4gICAgfSk7XG4gICAgaWYgKCFwcmVwYXJlUmVzdWx0KSB7XG4gICAgICAgIHJlcy5zdGF0dXNDb2RlID0gNDAwO1xuICAgICAgICByZXMuZW5kKCdCYWQgUmVxdWVzdCcpO1xuICAgICAgICBjdHgud2FpdFVudGlsID09IG51bGwgPyB2b2lkIDAgOiBjdHgud2FpdFVudGlsLmNhbGwoY3R4LCBQcm9taXNlLnJlc29sdmUoKSk7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCB7IGJ1aWxkSWQsIHBhcmFtcywgbmV4dENvbmZpZywgaXNEcmFmdE1vZGUsIHByZXJlbmRlck1hbmlmZXN0LCByb3V0ZXJTZXJ2ZXJDb250ZXh0LCBpc09uRGVtYW5kUmV2YWxpZGF0ZSwgcmV2YWxpZGF0ZU9ubHlHZW5lcmF0ZWQsIHJlc29sdmVkUGF0aG5hbWUgfSA9IHByZXBhcmVSZXN1bHQ7XG4gICAgY29uc3Qgbm9ybWFsaXplZFNyY1BhZ2UgPSBub3JtYWxpemVBcHBQYXRoKHNyY1BhZ2UpO1xuICAgIGxldCBpc0lzciA9IEJvb2xlYW4ocHJlcmVuZGVyTWFuaWZlc3QuZHluYW1pY1JvdXRlc1tub3JtYWxpemVkU3JjUGFnZV0gfHwgcHJlcmVuZGVyTWFuaWZlc3Qucm91dGVzW3Jlc29sdmVkUGF0aG5hbWVdKTtcbiAgICBpZiAoaXNJc3IgJiYgIWlzRHJhZnRNb2RlKSB7XG4gICAgICAgIGNvbnN0IGlzUHJlcmVuZGVyZWQgPSBCb29sZWFuKHByZXJlbmRlck1hbmlmZXN0LnJvdXRlc1tyZXNvbHZlZFBhdGhuYW1lXSk7XG4gICAgICAgIGNvbnN0IHByZXJlbmRlckluZm8gPSBwcmVyZW5kZXJNYW5pZmVzdC5keW5hbWljUm91dGVzW25vcm1hbGl6ZWRTcmNQYWdlXTtcbiAgICAgICAgaWYgKHByZXJlbmRlckluZm8pIHtcbiAgICAgICAgICAgIGlmIChwcmVyZW5kZXJJbmZvLmZhbGxiYWNrID09PSBmYWxzZSAmJiAhaXNQcmVyZW5kZXJlZCkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBOb0ZhbGxiYWNrRXJyb3IoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBsZXQgY2FjaGVLZXkgPSBudWxsO1xuICAgIGlmIChpc0lzciAmJiAhcm91dGVNb2R1bGUuaXNEZXYgJiYgIWlzRHJhZnRNb2RlKSB7XG4gICAgICAgIGNhY2hlS2V5ID0gcmVzb2x2ZWRQYXRobmFtZTtcbiAgICAgICAgLy8gZW5zdXJlIC9pbmRleCBhbmQgLyBpcyBub3JtYWxpemVkIHRvIG9uZSBrZXlcbiAgICAgICAgY2FjaGVLZXkgPSBjYWNoZUtleSA9PT0gJy9pbmRleCcgPyAnLycgOiBjYWNoZUtleTtcbiAgICB9XG4gICAgY29uc3Qgc3VwcG9ydHNEeW5hbWljUmVzcG9uc2UgPSAvLyBJZiB3ZSdyZSBpbiBkZXZlbG9wbWVudCwgd2UgYWx3YXlzIHN1cHBvcnQgZHluYW1pYyBIVE1MXG4gICAgcm91dGVNb2R1bGUuaXNEZXYgPT09IHRydWUgfHwgLy8gSWYgdGhpcyBpcyBub3QgU1NHIG9yIGRvZXMgbm90IGhhdmUgc3RhdGljIHBhdGhzLCB0aGVuIGl0IHN1cHBvcnRzXG4gICAgLy8gZHluYW1pYyBIVE1MLlxuICAgICFpc0lzcjtcbiAgICAvLyBUaGlzIGlzIGEgcmV2YWxpZGF0aW9uIHJlcXVlc3QgaWYgdGhlIHJlcXVlc3QgaXMgZm9yIGEgc3RhdGljXG4gICAgLy8gcGFnZSBhbmQgaXQgaXMgbm90IGJlaW5nIHJlc3VtZWQgZnJvbSBhIHBvc3Rwb25lZCByZW5kZXIgYW5kXG4gICAgLy8gaXQgaXMgbm90IGEgZHluYW1pYyBSU0MgcmVxdWVzdCB0aGVuIGl0IGlzIGEgcmV2YWxpZGF0aW9uXG4gICAgLy8gcmVxdWVzdC5cbiAgICBjb25zdCBpc1JldmFsaWRhdGUgPSBpc0lzciAmJiAhc3VwcG9ydHNEeW5hbWljUmVzcG9uc2U7XG4gICAgY29uc3QgbWV0aG9kID0gcmVxLm1ldGhvZCB8fCAnR0VUJztcbiAgICBjb25zdCB0cmFjZXIgPSBnZXRUcmFjZXIoKTtcbiAgICBjb25zdCBhY3RpdmVTcGFuID0gdHJhY2VyLmdldEFjdGl2ZVNjb3BlU3BhbigpO1xuICAgIGNvbnN0IGNvbnRleHQgPSB7XG4gICAgICAgIHBhcmFtcyxcbiAgICAgICAgcHJlcmVuZGVyTWFuaWZlc3QsXG4gICAgICAgIHJlbmRlck9wdHM6IHtcbiAgICAgICAgICAgIGV4cGVyaW1lbnRhbDoge1xuICAgICAgICAgICAgICAgIGNhY2hlQ29tcG9uZW50czogQm9vbGVhbihuZXh0Q29uZmlnLmV4cGVyaW1lbnRhbC5jYWNoZUNvbXBvbmVudHMpLFxuICAgICAgICAgICAgICAgIGF1dGhJbnRlcnJ1cHRzOiBCb29sZWFuKG5leHRDb25maWcuZXhwZXJpbWVudGFsLmF1dGhJbnRlcnJ1cHRzKVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHN1cHBvcnRzRHluYW1pY1Jlc3BvbnNlLFxuICAgICAgICAgICAgaW5jcmVtZW50YWxDYWNoZTogZ2V0UmVxdWVzdE1ldGEocmVxLCAnaW5jcmVtZW50YWxDYWNoZScpLFxuICAgICAgICAgICAgY2FjaGVMaWZlUHJvZmlsZXM6IChfbmV4dENvbmZpZ19leHBlcmltZW50YWwgPSBuZXh0Q29uZmlnLmV4cGVyaW1lbnRhbCkgPT0gbnVsbCA/IHZvaWQgMCA6IF9uZXh0Q29uZmlnX2V4cGVyaW1lbnRhbC5jYWNoZUxpZmUsXG4gICAgICAgICAgICBpc1JldmFsaWRhdGUsXG4gICAgICAgICAgICB3YWl0VW50aWw6IGN0eC53YWl0VW50aWwsXG4gICAgICAgICAgICBvbkNsb3NlOiAoY2IpPT57XG4gICAgICAgICAgICAgICAgcmVzLm9uKCdjbG9zZScsIGNiKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBvbkFmdGVyVGFza0Vycm9yOiB1bmRlZmluZWQsXG4gICAgICAgICAgICBvbkluc3RydW1lbnRhdGlvblJlcXVlc3RFcnJvcjogKGVycm9yLCBfcmVxdWVzdCwgZXJyb3JDb250ZXh0KT0+cm91dGVNb2R1bGUub25SZXF1ZXN0RXJyb3IocmVxLCBlcnJvciwgZXJyb3JDb250ZXh0LCByb3V0ZXJTZXJ2ZXJDb250ZXh0KVxuICAgICAgICB9LFxuICAgICAgICBzaGFyZWRDb250ZXh0OiB7XG4gICAgICAgICAgICBidWlsZElkXG4gICAgICAgIH1cbiAgICB9O1xuICAgIGNvbnN0IG5vZGVOZXh0UmVxID0gbmV3IE5vZGVOZXh0UmVxdWVzdChyZXEpO1xuICAgIGNvbnN0IG5vZGVOZXh0UmVzID0gbmV3IE5vZGVOZXh0UmVzcG9uc2UocmVzKTtcbiAgICBjb25zdCBuZXh0UmVxID0gTmV4dFJlcXVlc3RBZGFwdGVyLmZyb21Ob2RlTmV4dFJlcXVlc3Qobm9kZU5leHRSZXEsIHNpZ25hbEZyb21Ob2RlUmVzcG9uc2UocmVzKSk7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgaW52b2tlUm91dGVNb2R1bGUgPSBhc3luYyAoc3Bhbik9PntcbiAgICAgICAgICAgIHJldHVybiByb3V0ZU1vZHVsZS5oYW5kbGUobmV4dFJlcSwgY29udGV4dCkuZmluYWxseSgoKT0+e1xuICAgICAgICAgICAgICAgIGlmICghc3BhbikgcmV0dXJuO1xuICAgICAgICAgICAgICAgIHNwYW4uc2V0QXR0cmlidXRlcyh7XG4gICAgICAgICAgICAgICAgICAgICdodHRwLnN0YXR1c19jb2RlJzogcmVzLnN0YXR1c0NvZGUsXG4gICAgICAgICAgICAgICAgICAgICduZXh0LnJzYyc6IGZhbHNlXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgY29uc3Qgcm9vdFNwYW5BdHRyaWJ1dGVzID0gdHJhY2VyLmdldFJvb3RTcGFuQXR0cmlidXRlcygpO1xuICAgICAgICAgICAgICAgIC8vIFdlIHdlcmUgdW5hYmxlIHRvIGdldCBhdHRyaWJ1dGVzLCBwcm9iYWJseSBPVEVMIGlzIG5vdCBlbmFibGVkXG4gICAgICAgICAgICAgICAgaWYgKCFyb290U3BhbkF0dHJpYnV0ZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAocm9vdFNwYW5BdHRyaWJ1dGVzLmdldCgnbmV4dC5zcGFuX3R5cGUnKSAhPT0gQmFzZVNlcnZlclNwYW4uaGFuZGxlUmVxdWVzdCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYFVuZXhwZWN0ZWQgcm9vdCBzcGFuIHR5cGUgJyR7cm9vdFNwYW5BdHRyaWJ1dGVzLmdldCgnbmV4dC5zcGFuX3R5cGUnKX0nLiBQbGVhc2UgcmVwb3J0IHRoaXMgTmV4dC5qcyBpc3N1ZSBodHRwczovL2dpdGh1Yi5jb20vdmVyY2VsL25leHQuanNgKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCByb3V0ZSA9IHJvb3RTcGFuQXR0cmlidXRlcy5nZXQoJ25leHQucm91dGUnKTtcbiAgICAgICAgICAgICAgICBpZiAocm91dGUpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbmFtZSA9IGAke21ldGhvZH0gJHtyb3V0ZX1gO1xuICAgICAgICAgICAgICAgICAgICBzcGFuLnNldEF0dHJpYnV0ZXMoe1xuICAgICAgICAgICAgICAgICAgICAgICAgJ25leHQucm91dGUnOiByb3V0ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICdodHRwLnJvdXRlJzogcm91dGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAnbmV4dC5zcGFuX25hbWUnOiBuYW1lXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzcGFuLnVwZGF0ZU5hbWUobmFtZSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgc3Bhbi51cGRhdGVOYW1lKGAke21ldGhvZH0gJHtyZXEudXJsfWApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCBoYW5kbGVSZXNwb25zZSA9IGFzeW5jIChjdXJyZW50U3Bhbik9PntcbiAgICAgICAgICAgIHZhciBfY2FjaGVFbnRyeV92YWx1ZTtcbiAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlR2VuZXJhdG9yID0gYXN5bmMgKHsgcHJldmlvdXNDYWNoZUVudHJ5IH0pPT57XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFnZXRSZXF1ZXN0TWV0YShyZXEsICdtaW5pbWFsTW9kZScpICYmIGlzT25EZW1hbmRSZXZhbGlkYXRlICYmIHJldmFsaWRhdGVPbmx5R2VuZXJhdGVkICYmICFwcmV2aW91c0NhY2hlRW50cnkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcy5zdGF0dXNDb2RlID0gNDA0O1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gb24tZGVtYW5kIHJldmFsaWRhdGUgYWx3YXlzIHNldHMgdGhpcyBoZWFkZXJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ3gtbmV4dGpzLWNhY2hlJywgJ1JFVkFMSURBVEVEJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXMuZW5kKCdUaGlzIHBhZ2UgY291bGQgbm90IGJlIGZvdW5kJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGludm9rZVJvdXRlTW9kdWxlKGN1cnJlbnRTcGFuKTtcbiAgICAgICAgICAgICAgICAgICAgcmVxLmZldGNoTWV0cmljcyA9IGNvbnRleHQucmVuZGVyT3B0cy5mZXRjaE1ldHJpY3M7XG4gICAgICAgICAgICAgICAgICAgIGxldCBwZW5kaW5nV2FpdFVudGlsID0gY29udGV4dC5yZW5kZXJPcHRzLnBlbmRpbmdXYWl0VW50aWw7XG4gICAgICAgICAgICAgICAgICAgIC8vIEF0dGVtcHQgdXNpbmcgcHJvdmlkZWQgd2FpdFVudGlsIGlmIGF2YWlsYWJsZVxuICAgICAgICAgICAgICAgICAgICAvLyBpZiBpdCdzIG5vdCB3ZSBmYWxsYmFjayB0byBzZW5kUmVzcG9uc2UncyBoYW5kbGluZ1xuICAgICAgICAgICAgICAgICAgICBpZiAocGVuZGluZ1dhaXRVbnRpbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGN0eC53YWl0VW50aWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdHgud2FpdFVudGlsKHBlbmRpbmdXYWl0VW50aWwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBlbmRpbmdXYWl0VW50aWwgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY2FjaGVUYWdzID0gY29udGV4dC5yZW5kZXJPcHRzLmNvbGxlY3RlZFRhZ3M7XG4gICAgICAgICAgICAgICAgICAgIC8vIElmIHRoZSByZXF1ZXN0IGlzIGZvciBhIHN0YXRpYyByZXNwb25zZSwgd2UgY2FuIGNhY2hlIGl0IHNvIGxvbmdcbiAgICAgICAgICAgICAgICAgICAgLy8gYXMgaXQncyBub3QgZWRnZS5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzSXNyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBibG9iID0gYXdhaXQgcmVzcG9uc2UuYmxvYigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ29weSB0aGUgaGVhZGVycyBmcm9tIHRoZSByZXNwb25zZS5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGhlYWRlcnMgPSB0b05vZGVPdXRnb2luZ0h0dHBIZWFkZXJzKHJlc3BvbnNlLmhlYWRlcnMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNhY2hlVGFncykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhlYWRlcnNbTkVYVF9DQUNIRV9UQUdTX0hFQURFUl0gPSBjYWNoZVRhZ3M7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWhlYWRlcnNbJ2NvbnRlbnQtdHlwZSddICYmIGJsb2IudHlwZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhlYWRlcnNbJ2NvbnRlbnQtdHlwZSddID0gYmxvYi50eXBlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmV2YWxpZGF0ZSA9IHR5cGVvZiBjb250ZXh0LnJlbmRlck9wdHMuY29sbGVjdGVkUmV2YWxpZGF0ZSA9PT0gJ3VuZGVmaW5lZCcgfHwgY29udGV4dC5yZW5kZXJPcHRzLmNvbGxlY3RlZFJldmFsaWRhdGUgPj0gSU5GSU5JVEVfQ0FDSEUgPyBmYWxzZSA6IGNvbnRleHQucmVuZGVyT3B0cy5jb2xsZWN0ZWRSZXZhbGlkYXRlO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZXhwaXJlID0gdHlwZW9mIGNvbnRleHQucmVuZGVyT3B0cy5jb2xsZWN0ZWRFeHBpcmUgPT09ICd1bmRlZmluZWQnIHx8IGNvbnRleHQucmVuZGVyT3B0cy5jb2xsZWN0ZWRFeHBpcmUgPj0gSU5GSU5JVEVfQ0FDSEUgPyB1bmRlZmluZWQgOiBjb250ZXh0LnJlbmRlck9wdHMuY29sbGVjdGVkRXhwaXJlO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ3JlYXRlIHRoZSBjYWNoZSBlbnRyeSBmb3IgdGhlIHJlc3BvbnNlLlxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY2FjaGVFbnRyeSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBraW5kOiBDYWNoZWRSb3V0ZUtpbmQuQVBQX1JPVVRFLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXM6IHJlc3BvbnNlLnN0YXR1cyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYm9keTogQnVmZmVyLmZyb20oYXdhaXQgYmxvYi5hcnJheUJ1ZmZlcigpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVhZGVyc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FjaGVDb250cm9sOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldmFsaWRhdGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4cGlyZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2FjaGVFbnRyeTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNlbmQgcmVzcG9uc2Ugd2l0aG91dCBjYWNoaW5nIGlmIG5vdCBJU1JcbiAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHNlbmRSZXNwb25zZShub2RlTmV4dFJlcSwgbm9kZU5leHRSZXMsIHJlc3BvbnNlLCBjb250ZXh0LnJlbmRlck9wdHMucGVuZGluZ1dhaXRVbnRpbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgICAgICAvLyBpZiB0aGlzIGlzIGEgYmFja2dyb3VuZCByZXZhbGlkYXRlIHdlIG5lZWQgdG8gcmVwb3J0XG4gICAgICAgICAgICAgICAgICAgIC8vIHRoZSByZXF1ZXN0IGVycm9yIGhlcmUgYXMgaXQgd29uJ3QgYmUgYnViYmxlZFxuICAgICAgICAgICAgICAgICAgICBpZiAocHJldmlvdXNDYWNoZUVudHJ5ID09IG51bGwgPyB2b2lkIDAgOiBwcmV2aW91c0NhY2hlRW50cnkuaXNTdGFsZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgcm91dGVNb2R1bGUub25SZXF1ZXN0RXJyb3IocmVxLCBlcnIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByb3V0ZXJLaW5kOiAnQXBwIFJvdXRlcicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcm91dGVQYXRoOiBzcmNQYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvdXRlVHlwZTogJ3JvdXRlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXZhbGlkYXRlUmVhc29uOiBnZXRSZXZhbGlkYXRlUmVhc29uKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNSZXZhbGlkYXRlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc09uRGVtYW5kUmV2YWxpZGF0ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCByb3V0ZXJTZXJ2ZXJDb250ZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNvbnN0IGNhY2hlRW50cnkgPSBhd2FpdCByb3V0ZU1vZHVsZS5oYW5kbGVSZXNwb25zZSh7XG4gICAgICAgICAgICAgICAgcmVxLFxuICAgICAgICAgICAgICAgIG5leHRDb25maWcsXG4gICAgICAgICAgICAgICAgY2FjaGVLZXksXG4gICAgICAgICAgICAgICAgcm91dGVLaW5kOiBSb3V0ZUtpbmQuQVBQX1JPVVRFLFxuICAgICAgICAgICAgICAgIGlzRmFsbGJhY2s6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHByZXJlbmRlck1hbmlmZXN0LFxuICAgICAgICAgICAgICAgIGlzUm91dGVQUFJFbmFibGVkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBpc09uRGVtYW5kUmV2YWxpZGF0ZSxcbiAgICAgICAgICAgICAgICByZXZhbGlkYXRlT25seUdlbmVyYXRlZCxcbiAgICAgICAgICAgICAgICByZXNwb25zZUdlbmVyYXRvcixcbiAgICAgICAgICAgICAgICB3YWl0VW50aWw6IGN0eC53YWl0VW50aWxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgLy8gd2UgZG9uJ3QgY3JlYXRlIGEgY2FjaGVFbnRyeSBmb3IgSVNSXG4gICAgICAgICAgICBpZiAoIWlzSXNyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoKGNhY2hlRW50cnkgPT0gbnVsbCA/IHZvaWQgMCA6IChfY2FjaGVFbnRyeV92YWx1ZSA9IGNhY2hlRW50cnkudmFsdWUpID09IG51bGwgPyB2b2lkIDAgOiBfY2FjaGVFbnRyeV92YWx1ZS5raW5kKSAhPT0gQ2FjaGVkUm91dGVLaW5kLkFQUF9ST1VURSkge1xuICAgICAgICAgICAgICAgIHZhciBfY2FjaGVFbnRyeV92YWx1ZTE7XG4gICAgICAgICAgICAgICAgdGhyb3cgT2JqZWN0LmRlZmluZVByb3BlcnR5KG5ldyBFcnJvcihgSW52YXJpYW50OiBhcHAtcm91dGUgcmVjZWl2ZWQgaW52YWxpZCBjYWNoZSBlbnRyeSAke2NhY2hlRW50cnkgPT0gbnVsbCA/IHZvaWQgMCA6IChfY2FjaGVFbnRyeV92YWx1ZTEgPSBjYWNoZUVudHJ5LnZhbHVlKSA9PSBudWxsID8gdm9pZCAwIDogX2NhY2hlRW50cnlfdmFsdWUxLmtpbmR9YCksIFwiX19ORVhUX0VSUk9SX0NPREVcIiwge1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogXCJFNzAxXCIsXG4gICAgICAgICAgICAgICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghZ2V0UmVxdWVzdE1ldGEocmVxLCAnbWluaW1hbE1vZGUnKSkge1xuICAgICAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ3gtbmV4dGpzLWNhY2hlJywgaXNPbkRlbWFuZFJldmFsaWRhdGUgPyAnUkVWQUxJREFURUQnIDogY2FjaGVFbnRyeS5pc01pc3MgPyAnTUlTUycgOiBjYWNoZUVudHJ5LmlzU3RhbGUgPyAnU1RBTEUnIDogJ0hJVCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gRHJhZnQgbW9kZSBzaG91bGQgbmV2ZXIgYmUgY2FjaGVkXG4gICAgICAgICAgICBpZiAoaXNEcmFmdE1vZGUpIHtcbiAgICAgICAgICAgICAgICByZXMuc2V0SGVhZGVyKCdDYWNoZS1Db250cm9sJywgJ3ByaXZhdGUsIG5vLWNhY2hlLCBuby1zdG9yZSwgbWF4LWFnZT0wLCBtdXN0LXJldmFsaWRhdGUnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGhlYWRlcnMgPSBmcm9tTm9kZU91dGdvaW5nSHR0cEhlYWRlcnMoY2FjaGVFbnRyeS52YWx1ZS5oZWFkZXJzKTtcbiAgICAgICAgICAgIGlmICghKGdldFJlcXVlc3RNZXRhKHJlcSwgJ21pbmltYWxNb2RlJykgJiYgaXNJc3IpKSB7XG4gICAgICAgICAgICAgICAgaGVhZGVycy5kZWxldGUoTkVYVF9DQUNIRV9UQUdTX0hFQURFUik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBJZiBjYWNoZSBjb250cm9sIGlzIGFscmVhZHkgc2V0IG9uIHRoZSByZXNwb25zZSB3ZSBkb24ndFxuICAgICAgICAgICAgLy8gb3ZlcnJpZGUgaXQgdG8gYWxsb3cgdXNlcnMgdG8gY3VzdG9taXplIGl0IHZpYSBuZXh0LmNvbmZpZ1xuICAgICAgICAgICAgaWYgKGNhY2hlRW50cnkuY2FjaGVDb250cm9sICYmICFyZXMuZ2V0SGVhZGVyKCdDYWNoZS1Db250cm9sJykgJiYgIWhlYWRlcnMuZ2V0KCdDYWNoZS1Db250cm9sJykpIHtcbiAgICAgICAgICAgICAgICBoZWFkZXJzLnNldCgnQ2FjaGUtQ29udHJvbCcsIGdldENhY2hlQ29udHJvbEhlYWRlcihjYWNoZUVudHJ5LmNhY2hlQ29udHJvbCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYXdhaXQgc2VuZFJlc3BvbnNlKG5vZGVOZXh0UmVxLCBub2RlTmV4dFJlcywgbmV3IFJlc3BvbnNlKGNhY2hlRW50cnkudmFsdWUuYm9keSwge1xuICAgICAgICAgICAgICAgIGhlYWRlcnMsXG4gICAgICAgICAgICAgICAgc3RhdHVzOiBjYWNoZUVudHJ5LnZhbHVlLnN0YXR1cyB8fCAyMDBcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9O1xuICAgICAgICAvLyBUT0RPOiBhY3RpdmVTcGFuIGNvZGUgcGF0aCBpcyBmb3Igd2hlbiB3cmFwcGVkIGJ5XG4gICAgICAgIC8vIG5leHQtc2VydmVyIGNhbiBiZSByZW1vdmVkIHdoZW4gdGhpcyBpcyBubyBsb25nZXIgdXNlZFxuICAgICAgICBpZiAoYWN0aXZlU3Bhbikge1xuICAgICAgICAgICAgYXdhaXQgaGFuZGxlUmVzcG9uc2UoYWN0aXZlU3Bhbik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhd2FpdCB0cmFjZXIud2l0aFByb3BhZ2F0ZWRDb250ZXh0KHJlcS5oZWFkZXJzLCAoKT0+dHJhY2VyLnRyYWNlKEJhc2VTZXJ2ZXJTcGFuLmhhbmRsZVJlcXVlc3QsIHtcbiAgICAgICAgICAgICAgICAgICAgc3Bhbk5hbWU6IGAke21ldGhvZH0gJHtyZXEudXJsfWAsXG4gICAgICAgICAgICAgICAgICAgIGtpbmQ6IFNwYW5LaW5kLlNFUlZFUixcbiAgICAgICAgICAgICAgICAgICAgYXR0cmlidXRlczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgJ2h0dHAubWV0aG9kJzogbWV0aG9kLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2h0dHAudGFyZ2V0JzogcmVxLnVybFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgaGFuZGxlUmVzcG9uc2UpKTtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBpZiAoIShlcnIgaW5zdGFuY2VvZiBOb0ZhbGxiYWNrRXJyb3IpKSB7XG4gICAgICAgICAgICBhd2FpdCByb3V0ZU1vZHVsZS5vblJlcXVlc3RFcnJvcihyZXEsIGVyciwge1xuICAgICAgICAgICAgICAgIHJvdXRlcktpbmQ6ICdBcHAgUm91dGVyJyxcbiAgICAgICAgICAgICAgICByb3V0ZVBhdGg6IG5vcm1hbGl6ZWRTcmNQYWdlLFxuICAgICAgICAgICAgICAgIHJvdXRlVHlwZTogJ3JvdXRlJyxcbiAgICAgICAgICAgICAgICByZXZhbGlkYXRlUmVhc29uOiBnZXRSZXZhbGlkYXRlUmVhc29uKHtcbiAgICAgICAgICAgICAgICAgICAgaXNSZXZhbGlkYXRlLFxuICAgICAgICAgICAgICAgICAgICBpc09uRGVtYW5kUmV2YWxpZGF0ZVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICAvLyByZXRocm93IHNvIHRoYXQgd2UgY2FuIGhhbmRsZSBzZXJ2aW5nIGVycm9yIHBhZ2VcbiAgICAgICAgLy8gSWYgdGhpcyBpcyBkdXJpbmcgc3RhdGljIGdlbmVyYXRpb24sIHRocm93IHRoZSBlcnJvciBhZ2Fpbi5cbiAgICAgICAgaWYgKGlzSXNyKSB0aHJvdyBlcnI7XG4gICAgICAgIC8vIE90aGVyd2lzZSwgc2VuZCBhIDUwMCByZXNwb25zZS5cbiAgICAgICAgYXdhaXQgc2VuZFJlc3BvbnNlKG5vZGVOZXh0UmVxLCBub2RlTmV4dFJlcywgbmV3IFJlc3BvbnNlKG51bGwsIHtcbiAgICAgICAgICAgIHN0YXR1czogNTAwXG4gICAgICAgIH0pKTtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxufVxuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1hcHAtcm91dGUuanMubWFwXG4iXSwibmFtZXMiOltdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fgemini%2Froute&page=%2Fapi%2Fgemini%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fgemini%2Froute.ts&appDir=C%3A%5CUsers%5Ccpu%5CDesktop%5Cainek_mvp_claude%5Cainek%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Ccpu%5CDesktop%5Cainek_mvp_claude%5Cainek&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D&isGlobalNotFoundEnabled=!\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!******************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \******************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "(rsc)/./src/app/api/gemini/route.ts":
/*!*************************************!*\
  !*** ./src/app/api/gemini/route.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   POST: () => (/* binding */ POST)\n/* harmony export */ });\n/* harmony import */ var _google_genai__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @google/genai */ \"(rsc)/./node_modules/@google/genai/dist/node/index.mjs\");\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n\n\nconst ai = new _google_genai__WEBPACK_IMPORTED_MODULE_0__.GoogleGenAI({\n    apiKey: process.env.GEMINI_API_KEY || \"\"\n});\nasync function POST(req) {\n    try {\n        const { imageBase64, clothingName, clothingImageUrl } = await req.json();\n        if (!imageBase64) {\n            return next_server__WEBPACK_IMPORTED_MODULE_1__.NextResponse.json({\n                error: \"No image provided\"\n            }, {\n                status: 400\n            });\n        }\n        if (!process.env.GEMINI_API_KEY) {\n            return next_server__WEBPACK_IMPORTED_MODULE_1__.NextResponse.json({\n                error: \"GEMINI_API_KEY not configured\"\n            }, {\n                status: 500\n            });\n        }\n        const personImageData = imageBase64.replace(/^data:image\\/\\w+;base64,/, \"\");\n        const parts = [];\n        // Always add person photo first\n        parts.push({\n            inlineData: {\n                mimeType: \"image/jpeg\",\n                data: personImageData\n            }\n        });\n        // Add clothing image if available\n        if (clothingImageUrl && clothingImageUrl.startsWith(\"data:image/\")) {\n            const clothingData = clothingImageUrl.replace(/^data:image\\/\\w+;base64,/, \"\");\n            parts.push({\n                inlineData: {\n                    mimeType: \"image/jpeg\",\n                    data: clothingData\n                }\n            });\n            parts.push({\n                text: `You are a professional AI fashion photographer specializing in virtual try-on (VTON).\n\nINPUTS:\n- Image 1: Real photo of a person — source of body, pose, lighting, background\n- Image 2: Clothing product photo — source of garment design, color, print, texture\n\nTASK: Dress the person from Image 1 in the clothing from Image 2.\n\nPERSON (preserve exactly):\n- Face, skin tone, hair, body proportions — unchanged\n- Camera angle, pose, framing — unchanged  \n- Background and environment — unchanged\n\nCLOTHING INTEGRATION:\n- Garment must conform to the body: follow shoulders, chest, waist curves naturally\n- Fabric must drape with gravity: natural folds, creases, movement\n- Prints, logos, graphics, text must WRAP around body contours and fabric folds — 3D distortion, not flat paste\n- Pattern perspective must match the body viewing angle\n\nLIGHTING & SHADOWS (most important for realism):\n- Detect the light source direction and color temperature from Image 1\n- Apply matching shading: ambient light + diffuse highlights + specular gloss on fabric\n- Cast shadows: collar shadow on neck, sleeve shadow on arm, hem shadow below\n- Contact shadows at all garment-skin boundaries\n- The garment MUST show depth via shading — zero flat or uniformly lit areas\n- Color temperature of light on garment must match Image 1 (warm/cool/neutral)\n\nOUTPUT: One photorealistic image. The person wearing the garment. Indistinguishable from a real photo taken in the same location. No compositing artifacts, no flat areas, no pasted-on prints.`\n            });\n        } else {\n            parts.push({\n                text: `You are a professional AI fashion photographer specializing in virtual try-on (VTON).\n\nINPUT: Real photo of a person. Clothing to apply: \"${clothingName}\"\n\nTASK: Dress the person in \"${clothingName}\".\n\nPERSON (preserve exactly):\n- Face, skin tone, hair, body proportions — unchanged\n- Camera angle, pose, framing — unchanged\n- Background and environment — unchanged\n\nCLOTHING INTEGRATION:\n- Garment conforms naturally to the body curves and silhouette\n- Fabric drapes with gravity: natural folds, creases, movement\n- Any print, logo or pattern wraps realistically around body contours — 3D distortion, never flat\n\nLIGHTING & SHADOWS (most important for realism):\n- Match the light source direction and color temperature from the original photo\n- Apply diffuse shading, ambient light, and specular highlights on the fabric\n- Add cast shadows and contact shadows at all garment-skin boundaries\n- Garment must have depth from proper shading — never flat or uniformly lit\n- Light color temperature on garment must match the scene\n\nOUTPUT: One photorealistic image of the same person wearing \"${clothingName}\". Indistinguishable from a real photo. No artifacts, no flat areas.`\n            });\n        }\n        const response = await ai.models.generateContent({\n            model: \"gemini-2.5-flash-preview-image-generation\",\n            contents: [\n                {\n                    role: \"user\",\n                    parts: parts\n                }\n            ],\n            config: {\n                responseModalities: [\n                    _google_genai__WEBPACK_IMPORTED_MODULE_0__.Modality.TEXT,\n                    _google_genai__WEBPACK_IMPORTED_MODULE_0__.Modality.IMAGE\n                ],\n                temperature: 0.2\n            }\n        });\n        let generatedImageBase64 = null;\n        let textResponse = null;\n        for (const part of response.candidates?.[0]?.content?.parts || []){\n            if (part.inlineData?.mimeType?.startsWith(\"image/\")) {\n                generatedImageBase64 = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;\n            } else if (part.text) {\n                textResponse = part.text;\n            }\n        }\n        if (!generatedImageBase64) {\n            return next_server__WEBPACK_IMPORTED_MODULE_1__.NextResponse.json({\n                error: \"Model did not return an image. Try again.\",\n                text: textResponse\n            }, {\n                status: 500\n            });\n        }\n        return next_server__WEBPACK_IMPORTED_MODULE_1__.NextResponse.json({\n            success: true,\n            generatedImage: generatedImageBase64,\n            text: textResponse\n        });\n    } catch (error) {\n        console.error(\"Gemini API error:\", error);\n        const message = error instanceof Error ? error.message : String(error);\n        return next_server__WEBPACK_IMPORTED_MODULE_1__.NextResponse.json({\n            error: \"Failed to generate try-on image\",\n            details: message\n        }, {\n            status: 500\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,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O1FBQ1I7SUFFRixFQUFFLE9BQU94QixPQUFPO1FBQ2Q4QixRQUFROUIsS0FBSyxDQUFDLHFCQUFxQkE7UUFDbkMsTUFBTStCLFVBQVUvQixpQkFBaUJnQyxRQUFRaEMsTUFBTStCLE9BQU8sR0FBR0UsT0FBT2pDO1FBQ2hFLE9BQU9aLHFEQUFZQSxDQUFDVyxJQUFJLENBQ3RCO1lBQUVDLE9BQU87WUFBbUNrQyxTQUFTSDtRQUFRLEdBQzdEO1lBQUU5QixRQUFRO1FBQUk7SUFFbEI7QUFDRiIsInNvdXJjZXMiOlsiQzpcXFVzZXJzXFxjcHVcXERlc2t0b3BcXGFpbmVrX212cF9jbGF1ZGVcXGFpbmVrXFxzcmNcXGFwcFxcYXBpXFxnZW1pbmlcXHJvdXRlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEdvb2dsZUdlbkFJLCBNb2RhbGl0eSB9IGZyb20gXCJAZ29vZ2xlL2dlbmFpXCI7XG5pbXBvcnQgeyBOZXh0UmVxdWVzdCwgTmV4dFJlc3BvbnNlIH0gZnJvbSBcIm5leHQvc2VydmVyXCI7XG5cbmNvbnN0IGFpID0gbmV3IEdvb2dsZUdlbkFJKHsgYXBpS2V5OiBwcm9jZXNzLmVudi5HRU1JTklfQVBJX0tFWSB8fCBcIlwiIH0pO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gUE9TVChyZXE6IE5leHRSZXF1ZXN0KSB7XG4gIHRyeSB7XG4gICAgY29uc3QgeyBpbWFnZUJhc2U2NCwgY2xvdGhpbmdOYW1lLCBjbG90aGluZ0ltYWdlVXJsIH0gPSBhd2FpdCByZXEuanNvbigpO1xuXG4gICAgaWYgKCFpbWFnZUJhc2U2NCkge1xuICAgICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHsgZXJyb3I6IFwiTm8gaW1hZ2UgcHJvdmlkZWRcIiB9LCB7IHN0YXR1czogNDAwIH0pO1xuICAgIH1cbiAgICBpZiAoIXByb2Nlc3MuZW52LkdFTUlOSV9BUElfS0VZKSB7XG4gICAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oeyBlcnJvcjogXCJHRU1JTklfQVBJX0tFWSBub3QgY29uZmlndXJlZFwiIH0sIHsgc3RhdHVzOiA1MDAgfSk7XG4gICAgfVxuXG4gICAgY29uc3QgcGVyc29uSW1hZ2VEYXRhID0gaW1hZ2VCYXNlNjQucmVwbGFjZSgvXmRhdGE6aW1hZ2VcXC9cXHcrO2Jhc2U2NCwvLCBcIlwiKTtcblxuICAgIGNvbnN0IHBhcnRzOiBvYmplY3RbXSA9IFtdO1xuXG4gICAgLy8gQWx3YXlzIGFkZCBwZXJzb24gcGhvdG8gZmlyc3RcbiAgICBwYXJ0cy5wdXNoKHtcbiAgICAgIGlubGluZURhdGE6IHsgbWltZVR5cGU6IFwiaW1hZ2UvanBlZ1wiLCBkYXRhOiBwZXJzb25JbWFnZURhdGEgfSxcbiAgICB9KTtcblxuICAgIC8vIEFkZCBjbG90aGluZyBpbWFnZSBpZiBhdmFpbGFibGVcbiAgICBpZiAoY2xvdGhpbmdJbWFnZVVybCAmJiBjbG90aGluZ0ltYWdlVXJsLnN0YXJ0c1dpdGgoXCJkYXRhOmltYWdlL1wiKSkge1xuICAgICAgY29uc3QgY2xvdGhpbmdEYXRhID0gY2xvdGhpbmdJbWFnZVVybC5yZXBsYWNlKC9eZGF0YTppbWFnZVxcL1xcdys7YmFzZTY0LC8sIFwiXCIpO1xuICAgICAgcGFydHMucHVzaCh7XG4gICAgICAgIGlubGluZURhdGE6IHsgbWltZVR5cGU6IFwiaW1hZ2UvanBlZ1wiLCBkYXRhOiBjbG90aGluZ0RhdGEgfSxcbiAgICAgIH0pO1xuICAgICAgcGFydHMucHVzaCh7XG4gICAgICAgIHRleHQ6IGBZb3UgYXJlIGEgcHJvZmVzc2lvbmFsIEFJIGZhc2hpb24gcGhvdG9ncmFwaGVyIHNwZWNpYWxpemluZyBpbiB2aXJ0dWFsIHRyeS1vbiAoVlRPTikuXG5cbklOUFVUUzpcbi0gSW1hZ2UgMTogUmVhbCBwaG90byBvZiBhIHBlcnNvbiDigJQgc291cmNlIG9mIGJvZHksIHBvc2UsIGxpZ2h0aW5nLCBiYWNrZ3JvdW5kXG4tIEltYWdlIDI6IENsb3RoaW5nIHByb2R1Y3QgcGhvdG8g4oCUIHNvdXJjZSBvZiBnYXJtZW50IGRlc2lnbiwgY29sb3IsIHByaW50LCB0ZXh0dXJlXG5cblRBU0s6IERyZXNzIHRoZSBwZXJzb24gZnJvbSBJbWFnZSAxIGluIHRoZSBjbG90aGluZyBmcm9tIEltYWdlIDIuXG5cblBFUlNPTiAocHJlc2VydmUgZXhhY3RseSk6XG4tIEZhY2UsIHNraW4gdG9uZSwgaGFpciwgYm9keSBwcm9wb3J0aW9ucyDigJQgdW5jaGFuZ2VkXG4tIENhbWVyYSBhbmdsZSwgcG9zZSwgZnJhbWluZyDigJQgdW5jaGFuZ2VkICBcbi0gQmFja2dyb3VuZCBhbmQgZW52aXJvbm1lbnQg4oCUIHVuY2hhbmdlZFxuXG5DTE9USElORyBJTlRFR1JBVElPTjpcbi0gR2FybWVudCBtdXN0IGNvbmZvcm0gdG8gdGhlIGJvZHk6IGZvbGxvdyBzaG91bGRlcnMsIGNoZXN0LCB3YWlzdCBjdXJ2ZXMgbmF0dXJhbGx5XG4tIEZhYnJpYyBtdXN0IGRyYXBlIHdpdGggZ3Jhdml0eTogbmF0dXJhbCBmb2xkcywgY3JlYXNlcywgbW92ZW1lbnRcbi0gUHJpbnRzLCBsb2dvcywgZ3JhcGhpY3MsIHRleHQgbXVzdCBXUkFQIGFyb3VuZCBib2R5IGNvbnRvdXJzIGFuZCBmYWJyaWMgZm9sZHMg4oCUIDNEIGRpc3RvcnRpb24sIG5vdCBmbGF0IHBhc3RlXG4tIFBhdHRlcm4gcGVyc3BlY3RpdmUgbXVzdCBtYXRjaCB0aGUgYm9keSB2aWV3aW5nIGFuZ2xlXG5cbkxJR0hUSU5HICYgU0hBRE9XUyAobW9zdCBpbXBvcnRhbnQgZm9yIHJlYWxpc20pOlxuLSBEZXRlY3QgdGhlIGxpZ2h0IHNvdXJjZSBkaXJlY3Rpb24gYW5kIGNvbG9yIHRlbXBlcmF0dXJlIGZyb20gSW1hZ2UgMVxuLSBBcHBseSBtYXRjaGluZyBzaGFkaW5nOiBhbWJpZW50IGxpZ2h0ICsgZGlmZnVzZSBoaWdobGlnaHRzICsgc3BlY3VsYXIgZ2xvc3Mgb24gZmFicmljXG4tIENhc3Qgc2hhZG93czogY29sbGFyIHNoYWRvdyBvbiBuZWNrLCBzbGVldmUgc2hhZG93IG9uIGFybSwgaGVtIHNoYWRvdyBiZWxvd1xuLSBDb250YWN0IHNoYWRvd3MgYXQgYWxsIGdhcm1lbnQtc2tpbiBib3VuZGFyaWVzXG4tIFRoZSBnYXJtZW50IE1VU1Qgc2hvdyBkZXB0aCB2aWEgc2hhZGluZyDigJQgemVybyBmbGF0IG9yIHVuaWZvcm1seSBsaXQgYXJlYXNcbi0gQ29sb3IgdGVtcGVyYXR1cmUgb2YgbGlnaHQgb24gZ2FybWVudCBtdXN0IG1hdGNoIEltYWdlIDEgKHdhcm0vY29vbC9uZXV0cmFsKVxuXG5PVVRQVVQ6IE9uZSBwaG90b3JlYWxpc3RpYyBpbWFnZS4gVGhlIHBlcnNvbiB3ZWFyaW5nIHRoZSBnYXJtZW50LiBJbmRpc3Rpbmd1aXNoYWJsZSBmcm9tIGEgcmVhbCBwaG90byB0YWtlbiBpbiB0aGUgc2FtZSBsb2NhdGlvbi4gTm8gY29tcG9zaXRpbmcgYXJ0aWZhY3RzLCBubyBmbGF0IGFyZWFzLCBubyBwYXN0ZWQtb24gcHJpbnRzLmAsXG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcGFydHMucHVzaCh7XG4gICAgICAgIHRleHQ6IGBZb3UgYXJlIGEgcHJvZmVzc2lvbmFsIEFJIGZhc2hpb24gcGhvdG9ncmFwaGVyIHNwZWNpYWxpemluZyBpbiB2aXJ0dWFsIHRyeS1vbiAoVlRPTikuXG5cbklOUFVUOiBSZWFsIHBob3RvIG9mIGEgcGVyc29uLiBDbG90aGluZyB0byBhcHBseTogXCIke2Nsb3RoaW5nTmFtZX1cIlxuXG5UQVNLOiBEcmVzcyB0aGUgcGVyc29uIGluIFwiJHtjbG90aGluZ05hbWV9XCIuXG5cblBFUlNPTiAocHJlc2VydmUgZXhhY3RseSk6XG4tIEZhY2UsIHNraW4gdG9uZSwgaGFpciwgYm9keSBwcm9wb3J0aW9ucyDigJQgdW5jaGFuZ2VkXG4tIENhbWVyYSBhbmdsZSwgcG9zZSwgZnJhbWluZyDigJQgdW5jaGFuZ2VkXG4tIEJhY2tncm91bmQgYW5kIGVudmlyb25tZW50IOKAlCB1bmNoYW5nZWRcblxuQ0xPVEhJTkcgSU5URUdSQVRJT046XG4tIEdhcm1lbnQgY29uZm9ybXMgbmF0dXJhbGx5IHRvIHRoZSBib2R5IGN1cnZlcyBhbmQgc2lsaG91ZXR0ZVxuLSBGYWJyaWMgZHJhcGVzIHdpdGggZ3Jhdml0eTogbmF0dXJhbCBmb2xkcywgY3JlYXNlcywgbW92ZW1lbnRcbi0gQW55IHByaW50LCBsb2dvIG9yIHBhdHRlcm4gd3JhcHMgcmVhbGlzdGljYWxseSBhcm91bmQgYm9keSBjb250b3VycyDigJQgM0QgZGlzdG9ydGlvbiwgbmV2ZXIgZmxhdFxuXG5MSUdIVElORyAmIFNIQURPV1MgKG1vc3QgaW1wb3J0YW50IGZvciByZWFsaXNtKTpcbi0gTWF0Y2ggdGhlIGxpZ2h0IHNvdXJjZSBkaXJlY3Rpb24gYW5kIGNvbG9yIHRlbXBlcmF0dXJlIGZyb20gdGhlIG9yaWdpbmFsIHBob3RvXG4tIEFwcGx5IGRpZmZ1c2Ugc2hhZGluZywgYW1iaWVudCBsaWdodCwgYW5kIHNwZWN1bGFyIGhpZ2hsaWdodHMgb24gdGhlIGZhYnJpY1xuLSBBZGQgY2FzdCBzaGFkb3dzIGFuZCBjb250YWN0IHNoYWRvd3MgYXQgYWxsIGdhcm1lbnQtc2tpbiBib3VuZGFyaWVzXG4tIEdhcm1lbnQgbXVzdCBoYXZlIGRlcHRoIGZyb20gcHJvcGVyIHNoYWRpbmcg4oCUIG5ldmVyIGZsYXQgb3IgdW5pZm9ybWx5IGxpdFxuLSBMaWdodCBjb2xvciB0ZW1wZXJhdHVyZSBvbiBnYXJtZW50IG11c3QgbWF0Y2ggdGhlIHNjZW5lXG5cbk9VVFBVVDogT25lIHBob3RvcmVhbGlzdGljIGltYWdlIG9mIHRoZSBzYW1lIHBlcnNvbiB3ZWFyaW5nIFwiJHtjbG90aGluZ05hbWV9XCIuIEluZGlzdGluZ3Vpc2hhYmxlIGZyb20gYSByZWFsIHBob3RvLiBObyBhcnRpZmFjdHMsIG5vIGZsYXQgYXJlYXMuYCxcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgYWkubW9kZWxzLmdlbmVyYXRlQ29udGVudCh7XG4gICAgICBtb2RlbDogXCJnZW1pbmktMi41LWZsYXNoLXByZXZpZXctaW1hZ2UtZ2VuZXJhdGlvblwiLFxuICAgICAgY29udGVudHM6IFt7IHJvbGU6IFwidXNlclwiLCBwYXJ0czogcGFydHMgYXMgbmV2ZXIgfV0sXG4gICAgICBjb25maWc6IHtcbiAgICAgICAgcmVzcG9uc2VNb2RhbGl0aWVzOiBbTW9kYWxpdHkuVEVYVCwgTW9kYWxpdHkuSU1BR0VdLFxuICAgICAgICB0ZW1wZXJhdHVyZTogMC4yLFxuICAgICAgfSxcbiAgICB9KTtcblxuICAgIGxldCBnZW5lcmF0ZWRJbWFnZUJhc2U2NDogc3RyaW5nIHwgbnVsbCA9IG51bGw7XG4gICAgbGV0IHRleHRSZXNwb25zZTogc3RyaW5nIHwgbnVsbCA9IG51bGw7XG5cbiAgICBmb3IgKGNvbnN0IHBhcnQgb2YgcmVzcG9uc2UuY2FuZGlkYXRlcz8uWzBdPy5jb250ZW50Py5wYXJ0cyB8fCBbXSkge1xuICAgICAgaWYgKHBhcnQuaW5saW5lRGF0YT8ubWltZVR5cGU/LnN0YXJ0c1dpdGgoXCJpbWFnZS9cIikpIHtcbiAgICAgICAgZ2VuZXJhdGVkSW1hZ2VCYXNlNjQgPSBgZGF0YToke3BhcnQuaW5saW5lRGF0YS5taW1lVHlwZX07YmFzZTY0LCR7cGFydC5pbmxpbmVEYXRhLmRhdGF9YDtcbiAgICAgIH0gZWxzZSBpZiAocGFydC50ZXh0KSB7XG4gICAgICAgIHRleHRSZXNwb25zZSA9IHBhcnQudGV4dDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIWdlbmVyYXRlZEltYWdlQmFzZTY0KSB7XG4gICAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oXG4gICAgICAgIHsgZXJyb3I6IFwiTW9kZWwgZGlkIG5vdCByZXR1cm4gYW4gaW1hZ2UuIFRyeSBhZ2Fpbi5cIiwgdGV4dDogdGV4dFJlc3BvbnNlIH0sXG4gICAgICAgIHsgc3RhdHVzOiA1MDAgfVxuICAgICAgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oe1xuICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgIGdlbmVyYXRlZEltYWdlOiBnZW5lcmF0ZWRJbWFnZUJhc2U2NCxcbiAgICAgIHRleHQ6IHRleHRSZXNwb25zZSxcbiAgICB9KTtcblxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoXCJHZW1pbmkgQVBJIGVycm9yOlwiLCBlcnJvcik7XG4gICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oXG4gICAgICB7IGVycm9yOiBcIkZhaWxlZCB0byBnZW5lcmF0ZSB0cnktb24gaW1hZ2VcIiwgZGV0YWlsczogbWVzc2FnZSB9LFxuICAgICAgeyBzdGF0dXM6IDUwMCB9XG4gICAgKTtcbiAgfVxufSJdLCJuYW1lcyI6WyJHb29nbGVHZW5BSSIsIk1vZGFsaXR5IiwiTmV4dFJlc3BvbnNlIiwiYWkiLCJhcGlLZXkiLCJwcm9jZXNzIiwiZW52IiwiR0VNSU5JX0FQSV9LRVkiLCJQT1NUIiwicmVxIiwiaW1hZ2VCYXNlNjQiLCJjbG90aGluZ05hbWUiLCJjbG90aGluZ0ltYWdlVXJsIiwianNvbiIsImVycm9yIiwic3RhdHVzIiwicGVyc29uSW1hZ2VEYXRhIiwicmVwbGFjZSIsInBhcnRzIiwicHVzaCIsImlubGluZURhdGEiLCJtaW1lVHlwZSIsImRhdGEiLCJzdGFydHNXaXRoIiwiY2xvdGhpbmdEYXRhIiwidGV4dCIsInJlc3BvbnNlIiwibW9kZWxzIiwiZ2VuZXJhdGVDb250ZW50IiwibW9kZWwiLCJjb250ZW50cyIsInJvbGUiLCJjb25maWciLCJyZXNwb25zZU1vZGFsaXRpZXMiLCJURVhUIiwiSU1BR0UiLCJ0ZW1wZXJhdHVyZSIsImdlbmVyYXRlZEltYWdlQmFzZTY0IiwidGV4dFJlc3BvbnNlIiwicGFydCIsImNhbmRpZGF0ZXMiLCJjb250ZW50Iiwic3VjY2VzcyIsImdlbmVyYXRlZEltYWdlIiwiY29uc29sZSIsIm1lc3NhZ2UiLCJFcnJvciIsIlN0cmluZyIsImRldGFpbHMiXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./src/app/api/gemini/route.ts\n");

/***/ }),

/***/ "(ssr)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!******************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \******************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "../app-render/action-async-storage.external":
/*!*******************************************************************************!*\
  !*** external "next/dist/server/app-render/action-async-storage.external.js" ***!
  \*******************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/action-async-storage.external.js");

/***/ }),

/***/ "../app-render/after-task-async-storage.external":
/*!***********************************************************************************!*\
  !*** external "next/dist/server/app-render/after-task-async-storage.external.js" ***!
  \***********************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/after-task-async-storage.external.js");

/***/ }),

/***/ "./work-async-storage.external":
/*!*****************************************************************************!*\
  !*** external "next/dist/server/app-render/work-async-storage.external.js" ***!
  \*****************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-async-storage.external.js");

/***/ }),

/***/ "./work-unit-async-storage.external":
/*!**********************************************************************************!*\
  !*** external "next/dist/server/app-render/work-unit-async-storage.external.js" ***!
  \**********************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-unit-async-storage.external.js");

/***/ }),

/***/ "?32c4":
/*!****************************!*\
  !*** bufferutil (ignored) ***!
  \****************************/
/***/ (() => {

/* (ignored) */

/***/ }),

/***/ "?66e9":
/*!********************************!*\
  !*** utf-8-validate (ignored) ***!
  \********************************/
/***/ (() => {

/* (ignored) */

/***/ }),

/***/ "assert":
/*!*************************!*\
  !*** external "assert" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("assert");

/***/ }),

/***/ "buffer":
/*!*************************!*\
  !*** external "buffer" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("buffer");

/***/ }),

/***/ "child_process":
/*!********************************!*\
  !*** external "child_process" ***!
  \********************************/
/***/ ((module) => {

"use strict";
module.exports = require("child_process");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("crypto");

/***/ }),

/***/ "events":
/*!*************************!*\
  !*** external "events" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("events");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ "fs/promises":
/*!******************************!*\
  !*** external "fs/promises" ***!
  \******************************/
/***/ ((module) => {

"use strict";
module.exports = require("fs/promises");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("http");

/***/ }),

/***/ "https":
/*!************************!*\
  !*** external "https" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = require("https");

/***/ }),

/***/ "net":
/*!**********************!*\
  !*** external "net" ***!
  \**********************/
/***/ ((module) => {

"use strict";
module.exports = require("net");

/***/ }),

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "next/dist/shared/lib/no-fallback-error.external":
/*!******************************************************************!*\
  !*** external "next/dist/shared/lib/no-fallback-error.external" ***!
  \******************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/no-fallback-error.external");

/***/ }),

/***/ "next/dist/shared/lib/router/utils/app-paths":
/*!**************************************************************!*\
  !*** external "next/dist/shared/lib/router/utils/app-paths" ***!
  \**************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/router/utils/app-paths");

/***/ }),

/***/ "node:buffer":
/*!******************************!*\
  !*** external "node:buffer" ***!
  \******************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:buffer");

/***/ }),

/***/ "node:fs":
/*!**************************!*\
  !*** external "node:fs" ***!
  \**************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:fs");

/***/ }),

/***/ "node:http":
/*!****************************!*\
  !*** external "node:http" ***!
  \****************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:http");

/***/ }),

/***/ "node:https":
/*!*****************************!*\
  !*** external "node:https" ***!
  \*****************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:https");

/***/ }),

/***/ "node:net":
/*!***************************!*\
  !*** external "node:net" ***!
  \***************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:net");

/***/ }),

/***/ "node:path":
/*!****************************!*\
  !*** external "node:path" ***!
  \****************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:path");

/***/ }),

/***/ "node:process":
/*!*******************************!*\
  !*** external "node:process" ***!
  \*******************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:process");

/***/ }),

/***/ "node:stream":
/*!******************************!*\
  !*** external "node:stream" ***!
  \******************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:stream");

/***/ }),

/***/ "node:stream/promises":
/*!***************************************!*\
  !*** external "node:stream/promises" ***!
  \***************************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:stream/promises");

/***/ }),

/***/ "node:stream/web":
/*!**********************************!*\
  !*** external "node:stream/web" ***!
  \**********************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:stream/web");

/***/ }),

/***/ "node:url":
/*!***************************!*\
  !*** external "node:url" ***!
  \***************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:url");

/***/ }),

/***/ "node:util":
/*!****************************!*\
  !*** external "node:util" ***!
  \****************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:util");

/***/ }),

/***/ "node:zlib":
/*!****************************!*\
  !*** external "node:zlib" ***!
  \****************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:zlib");

/***/ }),

/***/ "os":
/*!*********************!*\
  !*** external "os" ***!
  \*********************/
/***/ ((module) => {

"use strict";
module.exports = require("os");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("path");

/***/ }),

/***/ "process":
/*!**************************!*\
  !*** external "process" ***!
  \**************************/
/***/ ((module) => {

"use strict";
module.exports = require("process");

/***/ }),

/***/ "querystring":
/*!******************************!*\
  !*** external "querystring" ***!
  \******************************/
/***/ ((module) => {

"use strict";
module.exports = require("querystring");

/***/ }),

/***/ "stream":
/*!*************************!*\
  !*** external "stream" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("stream");

/***/ }),

/***/ "tls":
/*!**********************!*\
  !*** external "tls" ***!
  \**********************/
/***/ ((module) => {

"use strict";
module.exports = require("tls");

/***/ }),

/***/ "tty":
/*!**********************!*\
  !*** external "tty" ***!
  \**********************/
/***/ ((module) => {

"use strict";
module.exports = require("tty");

/***/ }),

/***/ "url":
/*!**********************!*\
  !*** external "url" ***!
  \**********************/
/***/ ((module) => {

"use strict";
module.exports = require("url");

/***/ }),

/***/ "util":
/*!***********************!*\
  !*** external "util" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("util");

/***/ }),

/***/ "worker_threads":
/*!*********************************!*\
  !*** external "worker_threads" ***!
  \*********************************/
/***/ ((module) => {

"use strict";
module.exports = require("worker_threads");

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("zlib");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/google-auth-library","vendor-chunks/ws","vendor-chunks/gaxios","vendor-chunks/jws","vendor-chunks/retry","vendor-chunks/json-bigint","vendor-chunks/google-logging-utils","vendor-chunks/gcp-metadata","vendor-chunks/ecdsa-sig-formatter","vendor-chunks/@google","vendor-chunks/safe-buffer","vendor-chunks/p-retry","vendor-chunks/jwa","vendor-chunks/extend","vendor-chunks/buffer-equal-constant-time","vendor-chunks/bignumber.js","vendor-chunks/base64-js"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fgemini%2Froute&page=%2Fapi%2Fgemini%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fgemini%2Froute.ts&appDir=C%3A%5CUsers%5Ccpu%5CDesktop%5Cainek_mvp_claude%5Cainek%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Ccpu%5CDesktop%5Cainek_mvp_claude%5Cainek&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D&isGlobalNotFoundEnabled=!")));
module.exports = __webpack_exports__;

})();