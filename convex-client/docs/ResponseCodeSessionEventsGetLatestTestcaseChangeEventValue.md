# ResponseCodeSessionEventsGetLatestTestcaseChangeEventValue


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**event** | [**RequestCodeSessionEventsCommitCodeSessionEventArgsEventOneOf3**](RequestCodeSessionEventsCommitCodeSessionEventArgsEventOneOf3.md) |  | 
**id** | **str** | ID from table \&quot;codeSessionEvents\&quot; | 
**ts** | **float** |  | 

## Example

```python
from convex_client.models.response_code_session_events_get_latest_testcase_change_event_value import ResponseCodeSessionEventsGetLatestTestcaseChangeEventValue

# TODO update the JSON string below
json = "{}"
# create an instance of ResponseCodeSessionEventsGetLatestTestcaseChangeEventValue from a JSON string
response_code_session_events_get_latest_testcase_change_event_value_instance = ResponseCodeSessionEventsGetLatestTestcaseChangeEventValue.from_json(json)
# print the JSON string representation of the object
print(ResponseCodeSessionEventsGetLatestTestcaseChangeEventValue.to_json())

# convert the object into a dict
response_code_session_events_get_latest_testcase_change_event_value_dict = response_code_session_events_get_latest_testcase_change_event_value_instance.to_dict()
# create an instance of ResponseCodeSessionEventsGetLatestTestcaseChangeEventValue from a dict
response_code_session_events_get_latest_testcase_change_event_value_from_dict = ResponseCodeSessionEventsGetLatestTestcaseChangeEventValue.from_dict(response_code_session_events_get_latest_testcase_change_event_value_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


