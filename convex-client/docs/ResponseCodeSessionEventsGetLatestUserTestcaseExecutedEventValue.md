# ResponseCodeSessionEventsGetLatestUserTestcaseExecutedEventValue


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**event** | [**RequestCodeSessionEventsCommitCodeSessionEventArgsEventOneOf4**](RequestCodeSessionEventsCommitCodeSessionEventArgsEventOneOf4.md) |  | 
**id** | **str** | ID from table \&quot;codeSessionEvents\&quot; | 
**ts** | **float** |  | 

## Example

```python
from convex_client.models.response_code_session_events_get_latest_user_testcase_executed_event_value import ResponseCodeSessionEventsGetLatestUserTestcaseExecutedEventValue

# TODO update the JSON string below
json = "{}"
# create an instance of ResponseCodeSessionEventsGetLatestUserTestcaseExecutedEventValue from a JSON string
response_code_session_events_get_latest_user_testcase_executed_event_value_instance = ResponseCodeSessionEventsGetLatestUserTestcaseExecutedEventValue.from_json(json)
# print the JSON string representation of the object
print(ResponseCodeSessionEventsGetLatestUserTestcaseExecutedEventValue.to_json())

# convert the object into a dict
response_code_session_events_get_latest_user_testcase_executed_event_value_dict = response_code_session_events_get_latest_user_testcase_executed_event_value_instance.to_dict()
# create an instance of ResponseCodeSessionEventsGetLatestUserTestcaseExecutedEventValue from a dict
response_code_session_events_get_latest_user_testcase_executed_event_value_from_dict = ResponseCodeSessionEventsGetLatestUserTestcaseExecutedEventValue.from_dict(response_code_session_events_get_latest_user_testcase_executed_event_value_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


