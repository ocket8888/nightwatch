declare function filename_format({ testSuite, testCase, isError, dateObject }?: {
    testSuite?: string | undefined;
    testCase?: string | undefined;
    isError?: boolean | undefined;
    dateObject?: Date | undefined;
}): string;
declare const _default: {
    custom_commands_path: null;
    custom_assertions_path: null;
    page_objects_path: null;
    plugins: never[];
    globals_path: null;
    globals: {
        abortOnAssertionFailure: boolean;
        abortOnElementLocateError: boolean;
        waitForConditionPollInterval: number;
        waitForConditionTimeout: number;
        throwOnMultipleElementsReturned: boolean;
        suppressWarningsOnMultipleElementsReturned: boolean;
        asyncHookTimeout: number;
        unitTestsTimeout: number;
        customReporterCallbackTimeout: number;
        retryAssertionTimeout: number;
        reporter: <T = unknown>(results: T, cb: (arg: T) => void) => void;
        beforeTestSuite(): Promise<void>;
        afterTestSuite(): Promise<void>;
        beforeTestCase(): Promise<void>;
        afterTestCase(): Promise<void>;
        onBrowserNavigate(): Promise<void>;
        onBrowserQuit(): Promise<void>;
    };
    dotenv: {};
    persist_globals: boolean;
    output_folder: string;
    src_folders: null;
    live_output: boolean;
    disable_typescript: boolean;
    disable_colors: boolean;
    parallel_process_delay: number;
    selenium: {
        start_process: boolean;
        cli_args: {};
        server_path: null;
        log_path: string;
        port: undefined;
        check_process_delay: number;
        max_status_poll_tries: number;
        status_poll_interval: number;
    };
    start_session: boolean;
    end_session_on_fail: boolean;
    skip_testcases_on_fail: undefined;
    test_workers: boolean;
    test_runner: string;
    webdriver: {
        start_process: boolean;
        cli_args: {};
        server_path: null;
        log_path: string;
        log_file_name: string;
        check_process_delay: number;
        max_status_poll_tries: number;
        status_poll_interval: number;
        process_create_timeout: number;
        host: undefined;
        port: undefined;
        ssl: undefined;
        proxy: undefined;
        timeout_options: {
            timeout: number;
            retry_attempts: number;
        };
        default_path_prefix: undefined;
        username: undefined;
        access_key: undefined;
    };
    test_settings: {};
    launch_url: string;
    silent: boolean;
    output: boolean;
    detailed_output: boolean;
    output_timestamp: boolean;
    timestamp_format: string;
    disable_error_log: boolean;
    report_command_errors: boolean;
    report_network_errors: boolean;
    element_command_retries: number;
    screenshots: {
        enabled: boolean;
        filename_format: typeof filename_format;
        path: string;
        on_error: boolean;
        on_failure: boolean;
    };
    log_screenshot_data: boolean;
    desiredCapabilities: {
        browserName: string;
    };
    exclude: null;
    filter: null;
    skipgroup: string;
    sync_test_names: boolean;
    skiptags: string;
    use_xpath: boolean;
    parallel_mode: boolean;
    report_prefix: string;
    unit_testing_mode: boolean;
    default_reporter: string[];
    backwards_compatibility_mode: boolean;
    disable_global_apis: boolean;
    disable_global_expect: boolean;
    enable_fail_fast: boolean;
    always_async_commands: boolean;
};
export = _default;