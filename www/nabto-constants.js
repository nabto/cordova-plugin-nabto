function NabtoConstants() {}

////////////////////////////////////////////////////////////////////////////////
// from nabto_client_api.h
NabtoConstants.ClientApiErrors = {};
NabtoConstants.ClientApiErrors.OK                             = 0;
NabtoConstants.ClientApiErrors.NO_PROFILE                     = 1;
NabtoConstants.ClientApiErrors.ERROR_READING_CONFIG           = 2;
NabtoConstants.ClientApiErrors.API_NOT_INITIALIZED            = 3;
NabtoConstants.ClientApiErrors.INVALID_SESSION                = 4;
NabtoConstants.ClientApiErrors.OPEN_CERT_OR_PK_FAILED         = 5;
NabtoConstants.ClientApiErrors.UNLOCK_PK_FAILED               = 6;
NabtoConstants.ClientApiErrors.PORTAL_LOGIN_FAILURE           = 7;
NabtoConstants.ClientApiErrors.CERT_SIGNING_ERROR             = 8;
NabtoConstants.ClientApiErrors.CERT_SAVING_FAILURE            = 9;
NabtoConstants.ClientApiErrors.ADDRESS_IN_USE                 = 10;
NabtoConstants.ClientApiErrors.INVALID_ADDRESS                = 11;
NabtoConstants.ClientApiErrors.NO_NETWORK                     = 12;
NabtoConstants.ClientApiErrors.CONNECT_TO_HOST_FAILED         = 13;
NabtoConstants.ClientApiErrors.STREAMING_UNSUPPORTED          = 14;
NabtoConstants.ClientApiErrors.INVALID_STREAM                 = 15;
NabtoConstants.ClientApiErrors.DATA_PENDING                   = 16;
NabtoConstants.ClientApiErrors.BUFFER_FULL                    = 17;
NabtoConstants.ClientApiErrors.FAILED                         = 18;
NabtoConstants.ClientApiErrors.INVALID_TUNNEL                 = 19;
NabtoConstants.ClientApiErrors.ILLEGAL_PARAMETER              = 20;
NabtoConstants.ClientApiErrors.INVALID_RESOURCE               = 21;
NabtoConstants.ClientApiErrors.INVALID_STREAM_OPTION          = 22;
NabtoConstants.ClientApiErrors.INVALID_STREAM_OPTION_ARGUMENT = 23;
NabtoConstants.ClientApiErrors.ABORTED                        = 24;
NabtoConstants.ClientApiErrors.STREAM_CLOSED                  = 25;
NabtoConstants.ClientApiErrors.FAILED_WITH_JSON_MESSAGE       = 26;
NabtoConstants.ClientApiErrors.RPC_INTERFACE_NOT_SET          = 27;
NabtoConstants.ClientApiErrors.RPC_NO_SUCH_REQUEST            = 28;
NabtoConstants.ClientApiErrors.RPC_DEVICE_OFFLINE             = 29;
NabtoConstants.ClientApiErrors.RPC_RESPONSE_DECODE_FAILURE    = 30;

////////////////////////////////////////////////////////////////////////////////
// from unabto/src/unabto/unabto_protocol_exceptions.h
NabtoConstants.DeviceExceptions = {};
NabtoConstants.DeviceExceptions.NOT_READY        =  3;
NabtoConstants.DeviceExceptions.NO_ACCESS        =  4;
NabtoConstants.DeviceExceptions.TOO_SMALL        =  5;
NabtoConstants.DeviceExceptions.TOO_LARGE        =  6;
NabtoConstants.DeviceExceptions.INV_QUERY_ID     =  7;
NabtoConstants.DeviceExceptions.RSP_TOO_LARGE    =  8;
NabtoConstants.DeviceExceptions.OUT_OF_RESOURCES =  9;
NabtoConstants.DeviceExceptions.SYSTEM_ERROR     = 10;
NabtoConstants.DeviceExceptions.NO_QUERY_ID      = 11;


////////////////////////////////////////////////////////////////////////////////
// from nabto::Event
NabtoConstants.ClientEvents = {};
NabtoConstants.ClientEvents.UNSPECIFIED_ERROR                   =    1000000;
NabtoConstants.ClientEvents.PROGRAM_VERSION_CONFLICT            =    1000001;
NabtoConstants.ClientEvents.PROTOCOL_VERSION_CONFLICT           =    1000002;
NabtoConstants.ClientEvents.UDP_SOCKET_CREATION_ERROR           =    1000003;
NabtoConstants.ClientEvents.RESOLVER_ERROR                      =    1000004;
NabtoConstants.ClientEvents.STUN_ERROR                          =    1000005;
NabtoConstants.ClientEvents.UDT_SOCKET_CREATION_ERROR           =    1000006;
NabtoConstants.ClientEvents.UDT_CONNECTION_ERROR                =    1000007;
NabtoConstants.ClientEvents.FALLBACK_CONNECTION_ERROR           =    1000008;
NabtoConstants.ClientEvents.CONNECTION_ERROR                    =    1000009;
NabtoConstants.ClientEvents.UNKNOWN_SERVER                      =    1000010;
NabtoConstants.ClientEvents.ACCESS_DENIED                       =    1000011;
NabtoConstants.ClientEvents.CANNOT_VERIFY_CLIENT_CERTIFICATE    =    1000012;
NabtoConstants.ClientEvents.BAD_ID_IN_SERVER_CERTIFICATE        =    1000013;
NabtoConstants.ClientEvents.CANNOT_VERIFY_SERVER_CERTIFICATE    =    1000014;
NabtoConstants.ClientEvents.MICROSERVER_NOT_KNOWN               =    1000015;
NabtoConstants.ClientEvents.CONNECTION_PROBLEM                  =    1000016;
NabtoConstants.ClientEvents.ATTACH_LOST                         =    1000017;
NabtoConstants.ClientEvents.RESSOURCE_PROBLEM                   =    1000018;
NabtoConstants.ClientEvents.SYSTEM_ERROR                        =    1000019;
NabtoConstants.ClientEvents.ENCRYPTION_MISMATCH                 =    1000020;
NabtoConstants.ClientEvents.MICROSERVER_BUSY                    =    1000021;
NabtoConstants.ClientEvents.MICROSERVER_ADDR_MISMATCH           =    1000022;
NabtoConstants.ClientEvents.NO_RSP_FROM_CONTROLLER              =    1000023;
NabtoConstants.ClientEvents.MICROSERVER_REATTACHING             =    1000024;
NabtoConstants.ClientEvents.NO_RSP_FROM_SERVERPEER              =    1000025;
NabtoConstants.ClientEvents.CONNECT_TIMEOUT                     =    1000026;
NabtoConstants.ClientEvents.CERT_ID_NOT_FOUND                   =    1000100;
NabtoConstants.ClientEvents.CERT_FILE_NOT_FOUND                 =    1000101;
NabtoConstants.ClientEvents.CERT_FILE_INVALID                   =    1000102;
NabtoConstants.ClientEvents.CERT_INVALID_PSW                    =    1000103;
NabtoConstants.ClientEvents.CERT_KEY_FILE_MISSING               =    1000104;
NabtoConstants.ClientEvents.UNSPECIFIED_APL_ERROR               =    2000000;
NabtoConstants.ClientEvents.HTTP_SERVER_UNAVAILABLE             =    2000001;
NabtoConstants.ClientEvents.MISSING_PARAMETERS                  =    2000002;
NabtoConstants.ClientEvents.PASSWORD_TOO_SHORT                  =    2000003;
NabtoConstants.ClientEvents.DATA_DIR_ACCESS_ERROR               =    2000004;
NabtoConstants.ClientEvents.CERT_CREATION_ERROR                 =    2000005;
NabtoConstants.ClientEvents.CERT_SIGNING_ERROR                  =    2000006;
NabtoConstants.ClientEvents.CERT_SAVING_ERROR                   =    2000007;
NabtoConstants.ClientEvents.HTML_TEMPLATE_RENDERING_ERROR       =    2000008;
NabtoConstants.ClientEvents.PORTAL_LOGIN_FAILURE                =    2000009;
NabtoConstants.ClientEvents.PROXY_COULD_NOT_START               =    2000010;
NabtoConstants.ClientEvents.NETWORK_PROBED                      =    2000011;
NabtoConstants.ClientEvents.POST_DATA_RETRIEVAL_FAILED          =    2000012;
NabtoConstants.ClientEvents.POST_DATA_SUBMISSION_FAILED         =    2000013;
NabtoConstants.ClientEvents.NOT_LOGGED_IN                       =    2000014;
NabtoConstants.ClientEvents.TIME_OUT                            =    2000015;
NabtoConstants.ClientEvents.INVALID_PORT_NUMBER                 =    2000016;
NabtoConstants.ClientEvents.TUNNEL_COULD_NOT_START              =    2000017;
NabtoConstants.ClientEvents.PORT_ALREADY_IN_USE                 =    2000018;
NabtoConstants.ClientEvents.TUNNEL_DESTRUCTION_ERROR            =    2000019;
NabtoConstants.ClientEvents.DEVICE_REGISTRATION_FAILED          =    2000020;
NabtoConstants.ClientEvents.COULD_NOT_UNLOCK_DEVICE_KEY         =    2000021;
NabtoConstants.ClientEvents.COULD_NOT_STOP_CLIENT               =    2000022;
NabtoConstants.ClientEvents.QUERY_MODEL_PARSE_ERROR             =    2000023;
NabtoConstants.ClientEvents.INITIALIZATION_ERROR                =    2000024;
NabtoConstants.ClientEvents.INTERNAL_ERROR                      =    2000025;
NabtoConstants.ClientEvents.QUERY_MODEL_INVALID_ID              =    2000026;
NabtoConstants.ClientEvents.QUERY_MODEL_NO_SUCH_REQUEST         =    2000027    ;
NabtoConstants.ClientEvents.QUERY_MODEL_NO_SUCH_PARAMETER       =    2000028;
NabtoConstants.ClientEvents.QUERY_MODEL_PARAMETER_PARSE_ERROR   =    2000029;
NabtoConstants.ClientEvents.QUERY_MODEL_MISSING_PARAMETER       =    2000030;
NabtoConstants.ClientEvents.GUIREP_DOWNLOAD_FAIL                =    2000031;
NabtoConstants.ClientEvents.QUERY_SEND_FAILURE                  =    2000032;
NabtoConstants.ClientEvents.QUERY_RESPONSE_RECV_FAILURE         =    2000033         ;
NabtoConstants.ClientEvents.QUERY_RESPONSE_DECODE_FAILURE       =    2000034         ;
NabtoConstants.ClientEvents.NO_ACTIVE_REQUEST                   =    2000035;
NabtoConstants.ClientEvents.UNEXPECTED_RESPONSE_SIZE            =    2000036;
NabtoConstants.ClientEvents.GUIREP_INSTALL_FAILED               =    2000037;
NabtoConstants.ClientEvents.GUIREP_BAD_STRUCTURE                =    2000038;
NabtoConstants.ClientEvents.FILE_NOT_FOUND                      =    2000039;
NabtoConstants.ClientEvents.INSTALLATION_FILE_MISSING           =    2000040;
NabtoConstants.ClientEvents.PORTAL_AND_KEY_PASSWORD_MISMATCH    =    2000041;
NabtoConstants.ClientEvents.INVALID_URL                         =    2000042;
NabtoConstants.ClientEvents.OTHER_TASK_ACTIVE                   =    2000043;
NabtoConstants.ClientEvents.UNSUPPORTED_OBJECT_TYPE             =    2000044;
NabtoConstants.ClientEvents.TCP_SOCKET_PROBLEM                  =    2000045;
NabtoConstants.ClientEvents.ROOT_CERT_MISSING                   =    2000046;
NabtoConstants.ClientEvents.CONNECTION_RESET_BY_PEER            =    2000047;
NabtoConstants.ClientEvents.NO_NETWORK                          =    2000048;
NabtoConstants.ClientEvents.NO_INTERNET_ACCESS                  =    2000049;
NabtoConstants.ClientEvents.LOCAL_MICRO_CONNECT_FAILED          =    2000050;
NabtoConstants.ClientEvents.INVALID_EMAIL_ADDRESS               =    2000051;
NabtoConstants.ClientEvents.EMAIL_ADDRESS_IN_USE                =    2000052;
NabtoConstants.ClientEvents.DEVICE_ERR_UNKNOWN_QUERY_ID         =    2000053;
NabtoConstants.ClientEvents.BUFFER_TOO_SMALL                    =    2000054;
NabtoConstants.ClientEvents.INVALID_BUFFER                      =    2000055;
NabtoConstants.ClientEvents.INVALID_ENDPOINT                    =    2000056;
NabtoConstants.ClientEvents.NO_DATA_AVAILABLE                   =    2000057;
NabtoConstants.ClientEvents.DATA_TRANSMISSION_PROBLEM           =    2000058;
NabtoConstants.ClientEvents.SESSION_KEY_MISSING                 =    2000059;
NabtoConstants.ClientEvents.SESSION_KEY_INVALID                 =    2000060;
NabtoConstants.ClientEvents.MANIFEST_PARSE_ERROR                =    2000061;
NabtoConstants.ClientEvents.GENERIC_LOGIN_FAIL                  =    2000062;
NabtoConstants.ClientEvents.QUERY_JSON_PARSE_ERROR              =    2000063;
NabtoConstants.ClientEvents.EMPTY_PARAMETER                     =    2000064;
NabtoConstants.ClientEvents.UNABTO_APPLICATION_EXCEPTION        =    2000065;
NabtoConstants.ClientEvents.QUERY_MODEL_MISSING                 =    2000066;

module.exports = NabtoConstants;
