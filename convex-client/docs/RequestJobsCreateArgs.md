# RequestJobsCreateArgs


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**last_update** | **float** |  | 
**num_retries** | **float** |  | 
**session_id** | **str** | ID from table \&quot;sessions\&quot; | 
**status** | [**RequestJobsCreateArgsStatus**](RequestJobsCreateArgsStatus.md) |  | 

## Example

```python
from convex_client.models.request_jobs_create_args import RequestJobsCreateArgs

# TODO update the JSON string below
json = "{}"
# create an instance of RequestJobsCreateArgs from a JSON string
request_jobs_create_args_instance = RequestJobsCreateArgs.from_json(json)
# print the JSON string representation of the object
print(RequestJobsCreateArgs.to_json())

# convert the object into a dict
request_jobs_create_args_dict = request_jobs_create_args_instance.to_dict()
# create an instance of RequestJobsCreateArgs from a dict
request_jobs_create_args_from_dict = RequestJobsCreateArgs.from_dict(request_jobs_create_args_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


