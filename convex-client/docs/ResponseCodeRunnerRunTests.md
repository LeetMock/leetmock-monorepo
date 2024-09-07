# ResponseCodeRunnerRunTests


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **str** |  | 
**error_message** | **str** |  | [optional] 
**error_data** | **object** |  | [optional] 
**value** | **object** |  | [optional] 

## Example

```python
from convex_client.models.response_code_runner_run_tests import ResponseCodeRunnerRunTests

# TODO update the JSON string below
json = "{}"
# create an instance of ResponseCodeRunnerRunTests from a JSON string
response_code_runner_run_tests_instance = ResponseCodeRunnerRunTests.from_json(json)
# print the JSON string representation of the object
print(ResponseCodeRunnerRunTests.to_json())

# convert the object into a dict
response_code_runner_run_tests_dict = response_code_runner_run_tests_instance.to_dict()
# create an instance of ResponseCodeRunnerRunTests from a dict
response_code_runner_run_tests_from_dict = ResponseCodeRunnerRunTests.from_dict(response_code_runner_run_tests_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


