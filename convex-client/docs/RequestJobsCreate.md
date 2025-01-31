# RequestJobsCreate


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**args** | [**RequestJobsCreateArgs**](RequestJobsCreateArgs.md) |  | 

## Example

```python
from convex_client.models.request_jobs_create import RequestJobsCreate

# TODO update the JSON string below
json = "{}"
# create an instance of RequestJobsCreate from a JSON string
request_jobs_create_instance = RequestJobsCreate.from_json(json)
# print the JSON string representation of the object
print(RequestJobsCreate.to_json())

# convert the object into a dict
request_jobs_create_dict = request_jobs_create_instance.to_dict()
# create an instance of RequestJobsCreate from a dict
request_jobs_create_from_dict = RequestJobsCreate.from_dict(request_jobs_create_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


