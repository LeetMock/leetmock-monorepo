# RequestCodeRunnerRunCodeArgs


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**code** | **str** |  | 
**language** | **str** |  | 
**question_id** | **str** | ID from table \&quot;questions\&quot; | 

## Example

```python
from convex_client.models.request_code_runner_run_code_args import RequestCodeRunnerRunCodeArgs

# TODO update the JSON string below
json = "{}"
# create an instance of RequestCodeRunnerRunCodeArgs from a JSON string
request_code_runner_run_code_args_instance = RequestCodeRunnerRunCodeArgs.from_json(json)
# print the JSON string representation of the object
print(RequestCodeRunnerRunCodeArgs.to_json())

# convert the object into a dict
request_code_runner_run_code_args_dict = request_code_runner_run_code_args_instance.to_dict()
# create an instance of RequestCodeRunnerRunCodeArgs from a dict
request_code_runner_run_code_args_from_dict = RequestCodeRunnerRunCodeArgs.from_dict(request_code_runner_run_code_args_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


